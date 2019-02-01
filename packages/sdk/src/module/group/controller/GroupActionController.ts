import { daoManager, GroupConfigDao, QUERY_DIRECTION } from '../../../dao';
import AccountDao from '../../../dao/account';
import { GroupDao } from '../dao';
import { Raw, SortableModel } from '../../../framework/model';
import { GroupApiType } from '../../../models';
import {
  ACCOUNT_USER_ID,
  ACCOUNT_COMPANY_ID,
} from '../../../dao/account/constants';

import GroupServiceHandler from '../../../service/group/groupServiceHandler';
import ProfileService from '../../../service/profile';
import CompanyService from '../../../service/company';
import { GROUP_QUERY_TYPE, PERMISSION_ENUM } from '../../../service/constants';

import GroupAPI from '../../../api/glip/group';

import {
  uniqueArray,
  PerformanceTracerHolder,
  PERFORMANCE_KEYS,
} from '../../../utils';
import { transform } from '../../../service/utils';
import handleData, {
  filterGroups,
  sortFavoriteGroups,
} from '../service/handleData';
import Permission from '../service/permission';
import { mainLogger, err, ok, Result, JError } from 'foundation';
import { ENTITY } from '../../../service/eventKey';
import { extractHiddenGroupIds } from '../../../service/profile/handleData';
import TypeDictionary from '../../../utils/glip-type-dictionary/types';
import _ from 'lodash';
import { UserConfig } from '../../../service/account';
import { PersonService } from '../../person';
import { Person } from '../../person/entity';
import { compareName } from '../../../utils/helper';
import { FEATURE_STATUS, FEATURE_TYPE, TeamPermission, Group } from '../entity';
import { isValidEmailAddress } from '../../../utils/regexUtils';
import { Api } from '../../../api';
import notificationCenter from '../../../service/notificationCenter';
import PostService from '../../../service/post';
import { ErrorParserHolder } from '../../../error';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { IRequestController } from '../../../framework/controller/interface/IRequestController';
import { IEntityCacheSearchController } from '../../../framework/controller/interface/IEntityCacheSearchController';
import { CreateTeamOptions } from '../types';

const deleteAllTeamInformation = async (ids: number[]) => {
  const postService: PostService = PostService.getInstance();
  await postService.deletePostsByGroupIds(ids, true);
  const groupConfigDao = daoManager.getDao(GroupConfigDao);
  groupConfigDao.bulkDelete(ids);
};

export class GroupActionController {
  constructor(
    public entitySourceController: IEntitySourceController<Group>,
    public partialModifyController: IPartialModifyController<Group>,
    public entityCacheSearchController: IEntityCacheSearchController<Group>,
    public requestController: IRequestController<Group>,
  ) {}

  isCacheInitialized() {
    return this.entityCacheSearchController.isInitialized();
  }

  async getEntitiesFromCache(filterFunc?: (entity: Group) => boolean) {
    return await this.entityCacheSearchController.getEntities(filterFunc);
  }

  async getMultiEntitiesFromCache(
    ids: number[],
    filterFunc?: (entity: Group) => boolean,
  ) {
    return await this.entityCacheSearchController.getMultiEntities(
      ids,
      filterFunc,
    );
  }

  async getEntityFromCache(id: number) {
    return await this.entityCacheSearchController.getEntity(id);
  }

  async getGroupsByType(
    groupType = GROUP_QUERY_TYPE.ALL,
    offset = 0,
    _limit?: number,
  ): Promise<Group[]> {
    const profileService: ProfileService = ProfileService.getInstance();
    const limit = _limit || (await profileService.getMaxLeftRailGroup());
    mainLogger.debug(`offset:${offset} limit:${limit} groupType:${groupType}`);
    let result: Group[] = [];
    const dao = daoManager.getDao(GroupDao);

    if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
      result = await this._getFavoriteGroups();
    } else if (groupType === GROUP_QUERY_TYPE.ALL) {
      if (this.isCacheInitialized()) {
        result = await this.getEntitiesFromCache((item: Group) =>
          this.isValid(item),
        );
        result = this._getFromSortedByMostRectPost(result, offset, limit);
      } else {
        result = await dao.queryAllGroups(offset, limit);
      }
    } else {
      const profile = await profileService.getProfile();
      const favoriteGroupIds =
        profile && profile.favorite_group_ids ? profile.favorite_group_ids : [];
      const hiddenIds = profile ? extractHiddenGroupIds(profile) : [];
      const excludeIds = favoriteGroupIds.concat(hiddenIds);
      const userId = UserConfig.getCurrentUserId();
      const isTeam = groupType === GROUP_QUERY_TYPE.TEAM;
      if (this.isCacheInitialized()) {
        result = await this.getEntitiesFromCache(
          (item: Group) =>
            this.isValid(item) &&
            !excludeIds.includes(item.id) &&
            (userId ? item.members.includes(userId) : true) &&
            (isTeam ? item.is_team === isTeam : !item.is_team),
        );
        if (offset !== 0) {
          result = result.slice(offset + 1, result.length);
        }
      } else {
        result = await dao.queryGroups(
          offset,
          Infinity,
          isTeam,
          excludeIds,
          userId,
        );
      }
      result = await filterGroups(result, limit);
    }
    return groupType === GROUP_QUERY_TYPE.FAVORITE
      ? result
      : result.slice(0, result.length > 50 ? 50 : result.length);
  }

  async getGroupsByIds(ids: number[]): Promise<Group[]> {
    if (ids.length) {
      const groups = await Promise.all(
        ids.map(async (id: number) => {
          // const group = await this.getById(id);
          const group = await this.entitySourceController.get(id);
          return group;
        }),
      );
      return groups.filter(group => group !== null) as Group[];
    }
    return [];
  }

  async getLocalGroup(personIds: number[]): Promise<Group | null> {
    try {
      const result = await this._queryGroupByMemberList(personIds);
      if (result) {
        return result;
      }
      return null;
    } catch (e) {
      mainLogger.error(`getLocalGroup error =>${e}`);
      return null;
    }
  }

  async getGroupByPersonId(personId: number): Promise<Result<Group>> {
    return await this.getOrCreateGroupByMemberList([personId]);
  }

  async getOrCreateGroupByMemberList(
    members: number[],
  ): Promise<Result<Group>> {
    const result = await this._queryGroupByMemberList(members);
    if (result) {
      return ok(result);
    }
    return this.requestRemoteGroupByMemberList(members);
  }

  async requestRemoteGroupByMemberList(
    members: number[],
  ): Promise<Result<Group>> {
    const memberIds = this._addCurrentUserToMemList(members);
    const info: Partial<Group> = GroupServiceHandler.buildNewGroupInfo(
      memberIds,
    );
    const result = await GroupAPI.requestNewGroup(info);
    return result.match({
      Ok: async (rawGroup: Raw<Group>) => {
        const group = transform<Group>(rawGroup);
        await handleData([rawGroup]);
        return ok(group);
      },
      Err: (error: JError) => err(error),
    });
  }

  canPinPost(postId: number, group: Group): boolean {
    if (postId > 0 && group && !group.deactivated) {
      if (this.hasPermissionWithGroup(group, PERMISSION_ENUM.TEAM_PIN_POST)) {
        return true;
      }
    }
    return false;
  }

  async pinPost(postId: number, groupId: number, toPin: boolean) {
    const group = await this.entitySourceController.get(groupId);
    // const groupDao = daoManager.getDao(GroupDao);
    // if (this.isCacheInitialized()) {
    //   group = await this.getEntityFromCache(groupId);
    // } else {
    //   group = await groupDao.get(groupId);
    // }
    if (group && this.canPinPost(postId, group)) {
      // pinned_post_ids
      if (toPin) {
        if (!group.pinned_post_ids || !group.pinned_post_ids.includes(postId)) {
          group.pinned_post_ids = group.pinned_post_ids
            ? group.pinned_post_ids.concat(postId)
            : [postId];
        } else {
          // do nothing
          return null;
        }
      } else {
        if (group.pinned_post_ids && group.pinned_post_ids.includes(postId)) {
          group.pinned_post_ids = group.pinned_post_ids.filter(
            (id: number) => id !== postId,
          );
        } else {
          // do nothing
          return null;
        }
      }
      group._id = group.id;
      delete group.id;
      const path = group.is_team ? `/team/${group._id}` : `/group/${group._id}`;

      const result = await GroupAPI.pinPost(path, group);

      return result.match({
        Ok: async rawGroup => await this.handleRawGroup(rawGroup),
        Err: () => null,
      });
    }
    return null;
  }

  getPermissions(group: Group): PERMISSION_ENUM[] {
    const accountDao: AccountDao = daoManager.getKVDao(AccountDao);
    const userId = accountDao.get(ACCOUNT_USER_ID);
    const companyId = accountDao.get(ACCOUNT_COMPANY_ID);
    const permission = new Permission(group, userId, companyId);
    return permission.getPermissions();
  }

  hasPermissionWithGroup(group: Group, type: PERMISSION_ENUM): boolean {
    const permissionList = this.getPermissions(group);
    return permissionList.includes(type);
  }

  // async addTeamMembers(groupId: number, memberIds: number[]) {
  //   const result = await GroupAPI.addTeamMembers(groupId, memberIds);
  //   const rawGroup = result.expect('Failed to add team members.');
  //   const newGroup = await this.handleRawGroup(rawGroup);
  //   return newGroup;
  // }

  async createTeam(
    name: string,
    creator: number,
    memberIds: (number | string)[],
    description: string,
    options: CreateTeamOptions = {},
  ): Promise<Result<Group>> {
    const {
      isPublic = false,
      canAddMember = false,
      canPost = false,
      canAddIntegrations = false,
      canPin = false,
    } = options;
    const privacy = isPublic ? 'protected' : 'private';
    const permissionFlags = {
      TEAM_ADD_MEMBER: privacy === 'protected' ? true : canAddMember,
      TEAM_POST: canPost,
      TEAM_ADD_INTEGRATIONS: canPost ? canAddIntegrations : false,
      TEAM_PIN_POST: canPost ? canPin : false,
      TEAM_ADMIN: false,
    };
    const userPermissionMask = Permission.createPermissionsMask(
      permissionFlags,
    );
    const team: Partial<GroupApiType> = {
      privacy,
      description,
      set_abbreviation: name,
      members: memberIds.concat(creator),
      permissions: {
        admin: {
          uids: [creator],
        },
        user: {
          uids: [],
          level: userPermissionMask,
        },
      },
    };

    const apiResult = await GroupAPI.createTeam(team);

    const result = apiResult.match({
      Ok: async (rawGroup: Raw<Group>) => {
        const newGroup = await this.handleRawGroup(rawGroup);
        return ok(newGroup);
      },
      Err: (error: JError) => err(error),
    });
    return result;
  }

  async handleRawGroup(rawGroup: Raw<Group>): Promise<Group> {
    const group = transform<Group>(rawGroup);
    await handleData([rawGroup]);
    return group;
  }

  async getLeftRailGroups(): Promise<Group[]> {
    let result: Group[] = [];
    let groups = await this.getGroupsByType(GROUP_QUERY_TYPE.FAVORITE);
    result = result.concat(groups);

    groups = await this.getGroupsByType(GROUP_QUERY_TYPE.GROUP);
    result = result.concat(groups);

    groups = await this.getGroupsByType(GROUP_QUERY_TYPE.TEAM);
    result = result.concat(groups);
    return result;
  }

  // update partial group data
  async updateGroupPartialData(params: Partial<Group>): Promise<boolean> {
    try {
      await this.partialModifyController.updatePartially(
        params.id || 0,
        undefined,
        async (updatedModel: Group) => {
          return updatedModel;
        },
      );
      // await this.handlePartialUpdate(
      //   params,
      //   undefined,
      //   async (updatedModel: Group) => {
      //     return updatedModel;
      //   },
      // );
      return true;
    } catch (error) {
      throw ErrorParserHolder.getErrorParser().parse(error);
    }
  }

  async updateGroupPrivacy(params: {
    id: number;
    privacy: string;
  }): Promise<void> {
    await this.partialModifyController.updatePartially(
      params.id,
      (partialEntity: Partial<Group>, originEntity: Group) => {
        return { ...partialEntity, privacy: params.privacy };
      },
      async (updateEntity: Group) =>
        await this.requestController.put(updateEntity),
    );

    // const result = await this._updateGroup(params.id, {
    //   privacy: params.privacy,
    // });
    // return result;
  }

  async buildGroupFeatureMap(
    groupId: number,
  ): Promise<Map<FEATURE_TYPE, FEATURE_STATUS>> {
    const actionMap = new Map<FEATURE_TYPE, FEATURE_STATUS>();
    actionMap.set(FEATURE_TYPE.CALL, FEATURE_STATUS.INVISIBLE); // can not make call in group

    const group = await this.entitySourceController.get(groupId);
    actionMap.set(
      FEATURE_TYPE.MESSAGE,
      group ? this._checkGroupMessageStatus(group) : FEATURE_STATUS.INVISIBLE,
    );

    // To-Do
    actionMap.set(FEATURE_TYPE.CONFERENCE, FEATURE_STATUS.INVISIBLE); // can not make conference in group for nwo
    actionMap.set(FEATURE_TYPE.VIDEO, FEATURE_STATUS.INVISIBLE); // can not make video in group for now
    return actionMap;
  }

  async isFavored(id: number, type: number): Promise<boolean> {
    let groupId: number | undefined = undefined;
    switch (type) {
      case TypeDictionary.TYPE_ID_PERSON: {
        const group = await this.getLocalGroup([id]);
        if (group) {
          groupId = group.id;
        }
        break;
      }
      case TypeDictionary.TYPE_ID_GROUP:
      case TypeDictionary.TYPE_ID_TEAM: {
        groupId = id;
        break;
      }
      default: {
        mainLogger.error('isFavored : should not run to here');
      }
    }

    if (groupId) {
      return await this._isGroupFavored(groupId);
    }

    return false;
  }

  async doFuzzySearchGroups(
    searchKey: string,
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  } | null> {
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.SEARCH_GROUP,
      logId,
    );
    const currentUserId = UserConfig.getCurrentUserId();
    if (!currentUserId) {
      return null;
    }

    const sortFunc = async (
      group: Group,
      terms: string[],
    ): Promise<SortableModel<Group> | null> => {
      if (this._isValidGroup(group) && group.members.length > 2) {
        const groupName = await this.getGroupNameByMultiMembers(
          group.members,
          currentUserId,
        );

        if (
          (terms.length > 0 &&
            this.entityCacheSearchController.isFuzzyMatched(
              groupName,
              terms,
            )) ||
          (fetchAllIfSearchKeyEmpty && terms.length === 0)
        ) {
          return {
            id: group.id,
            displayName: groupName,
            firstSortKey: groupName.toLowerCase(),
            entity: group,
          };
        }
      }
      return null;
    };

    // const result = await this.searchEntitiesFromCache(
    const result = await this.entityCacheSearchController.searchEntities(
      sortFunc,
      searchKey,
      undefined,
      (groupA: SortableModel<Group>, groupB: SortableModel<Group>) => {
        if (groupA.firstSortKey < groupB.firstSortKey) {
          return -1;
        }
        if (groupA.firstSortKey > groupB.firstSortKey) {
          return 1;
        }
        return 0;
      },
    );
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
    return result;
  }

  async doFuzzySearchTeams(
    searchKey?: string,
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  } | null> {
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.SEARCH_TEAM,
      logId,
    );
    const currentUserId = UserConfig.getCurrentUserId();
    if (!currentUserId) {
      return null;
    }

    const kSortingRateWithFirstMatched: number = 1;
    const kSortingRateWithFirstAndPositionMatched: number = 1.1;

    // const result = await this.searchEntitiesFromCache(
    const result = await this.entityCacheSearchController.searchEntities(
      async (team: Group, terms: string[]) => {
        let isMatched: boolean = false;
        let sortValue: number = 0;

        do {
          if (!this._idValidTeam(team)) {
            break;
          }

          if (fetchAllIfSearchKeyEmpty && terms.length === 0) {
            isMatched = this._isPublicTeamOrIncludeUser(team, currentUserId);
          }

          if (isMatched || terms.length === 0) {
            break;
          }

          if (
            !this.entityCacheSearchController.isFuzzyMatched(
              team.set_abbreviation,
              terms,
            )
          ) {
            break;
          }

          if (!this._isPublicTeamOrIncludeUser(team, currentUserId)) {
            break;
          }

          const splitNames = this.entityCacheSearchController.getTermsFromSearchKey(
            team.set_abbreviation,
          );

          for (let i = 0; i < splitNames.length; ++i) {
            for (let j = 0; j < terms.length; ++j) {
              if (
                this.entityCacheSearchController.isStartWithMatched(
                  splitNames[i],
                  [terms[j]],
                )
              ) {
                sortValue +=
                  i === j
                    ? kSortingRateWithFirstAndPositionMatched
                    : kSortingRateWithFirstMatched;
              }
            }
          }

          isMatched = true;
        } while (false);

        return isMatched
          ? {
            id: team.id,
            displayName: team.set_abbreviation,
            firstSortKey: sortValue,
            secondSortKey: team.set_abbreviation.toLowerCase(),
            entity: team,
          }
          : null;
      },
      searchKey,
      undefined,
      (groupA: SortableModel<Group>, groupB: SortableModel<Group>) => {
        if (groupA.firstSortKey > groupB.firstSortKey) {
          return -1;
        }
        if (groupA.firstSortKey < groupB.firstSortKey) {
          return 1;
        }

        if (groupA.secondSortKey < groupB.secondSortKey) {
          return -1;
        }
        if (groupA.secondSortKey > groupB.secondSortKey) {
          return 1;
        }
        return 0;
      },
    );
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
    return result;
  }

  async getGroupNameByMultiMembers(members: number[], currentUserId: number) {
    const names: string[] = [];
    const emails: string[] = [];

    const personService: PersonService = PersonService.getInstance();
    const diffMembers = _.difference(members, [currentUserId]);

    const promises = diffMembers.map(async (id: number) => {
      return personService.getById(id);
    });

    await Promise.all(promises).then((persons: any[]) => {
      persons.forEach((person: Person) => {
        if (person) {
          const name = personService.getName(person);
          if (name.length > 0) {
            names.push(name);
          } else {
            emails.push(person.email);
          }
        }
      });
    });

    return names
      .sort(compareName)
      .concat(emails.sort(compareName))
      .join(', ');
  }

  isTeamAdmin(personId: number, permission?: TeamPermission) {
    if (permission) {
      // for some old team, thy don't have permission, so all member are admin
      const adminUserIds = this._getTeamAdmins(permission);
      return adminUserIds.some((x: number) => x === personId);
    }
    return true;
  }

  async getGroupEmail(groupId: number): Promise<string> {
    const group = await this.entitySourceController.get(groupId);
    let email = '';
    if (group) {
      const companyService: CompanyService = CompanyService.getInstance();
      const companyReplyDomain = await companyService.getCompanyEmailDomain(
        group.company_id,
      );

      if (companyReplyDomain) {
        const envDomain = this._getENVDomain();
        if (group.email_friendly_abbreviation) {
          email = `${
            group.email_friendly_abbreviation
          }@${companyReplyDomain}.${envDomain}`;
        }

        if (!isValidEmailAddress(email)) {
          email = `${group.id}@${companyReplyDomain}.${envDomain}`;
        }
      }
    }
    return email;
  }

  // update partial group data, for last accessed time
  async updateGroupLastAccessedTime(params: {
    id: number;
    timestamp: number;
  }): Promise<boolean> {
    const { id, timestamp } = params;
    const result = await this.updateGroupPartialData({
      id,
      __last_accessed_at: timestamp,
    });
    return result;
  }

  async removeTeamsByIds(ids: number[], shouldNotify: boolean) {
    const dao = daoManager.getDao(GroupDao);
    await dao.bulkDelete(ids);
    if (shouldNotify) {
      notificationCenter.emitEntityDelete(ENTITY.GROUP, ids);
    }
    deleteAllTeamInformation(ids);
  }

  async setAsTrue4HasMoreConfigByDirection(
    ids: number[],
    direction: QUERY_DIRECTION,
  ): Promise<void> {
    if (!ids.length) {
      return;
    }
    const data: any = [];
    ids.forEach((id: number) => {
      const config = {
        id,
      };
      if (direction === QUERY_DIRECTION.OLDER) {
        config['has_more_older'] = true;
      } else {
        config['has_more_newer'] = true;
      }
      data.push(config);
    });
    const groupConfigDao = daoManager.getDao(GroupConfigDao);
    groupConfigDao.bulkUpdate(data);
  }

  async isGroupCanBeShown(groupId: number): Promise<boolean> {
    const profileService: ProfileService = ProfileService.getInstance();
    const isHidden = await profileService.isConversationHidden(groupId);
    let isIncludeSelf = false;
    let isValid = false;
    const group = await this.entitySourceController.get(groupId);
    if (group) {
      isValid = this.isValid(group);
      const currentUserId = UserConfig.getCurrentUserId();
      isIncludeSelf = group.members.includes(currentUserId);
    }
    return !isHidden && isValid && isIncludeSelf;
  }

  // private async _updateGroup(
  //   id: number,
  //   data: Partial<Group>,
  // ): Promise<boolean> {
  //   data.id = id;
  //   // const result = await this.handlePartialUpdate(
  //   const result = await this.partialModifyController.updatePartially(
  //     data.id,
  //     undefined,
  //     async (updatedModel: Group) => {
  //       return await this._doUpdateGroup(id, updatedModel);
  //     },
  //   );
  //   if (result.isOk()) {
  //     return true;
  //   }
  //   if (!result.apiError) {
  //     throw new JSdkError(ERROR_CODES_SDK.GENERAL, 'undefined ERROR');
  //   }
  //   throw result.apiError.code;
  // }

  // update partial group data http
  // private async _doUpdateGroup(
  //   id: number,
  //   group: Group,
  // ): Promise<Group | JError> {
  //   const apiResult = await GroupAPI.putTeamById(id, group);
  //   if (apiResult.isOk()) {
  //     return transform<Group>(apiResult.data);
  //   }
  //   return apiResult.error;
  // }

  private async _isGroupFavored(groupId: number): Promise<boolean> {
    const profileService: ProfileService = ProfileService.getInstance();
    const profile = await profileService.getProfile();
    const favoriteGroupIds =
      profile && profile.favorite_group_ids ? profile.favorite_group_ids : [];
    return favoriteGroupIds.some((x: number) => groupId === x);
  }

  private _checkGroupMessageStatus(group: Group) {
    return this._isCurrentUserInGroup(group)
      ? FEATURE_STATUS.ENABLE
      : FEATURE_STATUS.INVISIBLE;
  }

  private _isCurrentUserInGroup(group: Group) {
    const currentUserId = UserConfig.getCurrentUserId();
    return group
      ? group.members.some((x: number) => x === currentUserId)
      : false;
  }

  private _isPublicTeamOrIncludeUser(team: Group, userId: number) {
    return team.privacy === 'protected' || team.members.includes(userId);
  }

  private async _queryGroupByMemberList(ids: number[]): Promise<Group | null> {
    const memberIds = this._addCurrentUserToMemList(ids);
    const groupDao = daoManager.getDao(GroupDao);
    if (this.isCacheInitialized()) {
      const result = await this.getEntitiesFromCache(
        (item: Group) =>
          this.isValid(item) &&
          !item.is_team &&
          item.members &&
          item.members.sort().toString() === memberIds.sort().toString(),
      );
      return result[0];
    }
    return await groupDao.queryGroupByMemberList(memberIds);
  }

  private _addCurrentUserToMemList(ids: number[]) {
    const userId = UserConfig.getCurrentUserId();
    if (userId) {
      ids.push(userId);
    }
    return uniqueArray(ids);
  }

  private _getENVDomain() {
    let apiServer = Api.httpConfig['glip'].server;
    if (apiServer) {
      let index = apiServer.indexOf('://');
      if (index > -1) {
        apiServer = apiServer.substr(index + 3);
      }

      index = apiServer.lastIndexOf(':');
      if (index > -1) {
        apiServer = apiServer.substring(0, index);
      }

      index = apiServer.indexOf('.');
      if (index !== -1 && apiServer.substr(0, index) === 'app') {
        apiServer = apiServer.substr(index + 1);
      }
    }
    return apiServer;
  }

  private _isValidGroup(group: Group) {
    return this.isValid(group) && !group.is_team;
  }

  private _idValidTeam(group: Group) {
    return this.isValid(group) && group.is_team;
  }

  public isValid(group: Group) {
    return !group.is_archived && !group.deactivated && !!group.members;
  }

  private _getTeamAdmins(permission?: TeamPermission) {
    return permission && permission.admin ? permission.admin.uids : [];
  }

  private async _getFavoriteGroups(): Promise<Group[]> {
    const profileService: ProfileService = ProfileService.getInstance();
    const profile = await profileService.getProfile();
    if (
      profile &&
      profile.favorite_group_ids &&
      profile.favorite_group_ids.length > 0
    ) {
      let favoriteGroupIds = profile.favorite_group_ids.filter(
        (id: any) => typeof id === 'number' && !isNaN(id),
      );
      const hiddenIds = extractHiddenGroupIds(profile);
      favoriteGroupIds = _.difference(favoriteGroupIds, hiddenIds);
      if (this.isCacheInitialized()) {
        return await this.getMultiEntitiesFromCache(
          favoriteGroupIds,
          (item: Group) => this.isValid(item),
        );
      }
      const dao = daoManager.getDao(GroupDao);
      const result = await dao.queryGroupsByIds(favoriteGroupIds);
      return sortFavoriteGroups(favoriteGroupIds, result);
    }
    return [];
  }

  private _getFromSortedByMostRectPost(
    groups: Group[],
    offset: number,
    limit: number,
  ) {
    return _.orderBy(groups, ['most_recent_post_created_at'], ['desc']).slice(
      offset,
      limit === Infinity ? groups.length : limit,
    );
  }
}
