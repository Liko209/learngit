/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 09:56:16
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager, ConfigDao } from '../../dao';
import AccountDao from '../../dao/account';
import GroupDao from '../../dao/group';
import { Group, GroupApiType, Raw, SortableModel } from '../../models';
import {
  ACCOUNT_USER_ID,
  ACCOUNT_COMPANY_ID,
} from '../../dao/account/constants';

import BaseService from '../../service/BaseService';
import GroupServiceHandler from '../../service/group/groupServiceHandler';
import ProfileService from '../../service/profile';
import { GROUP_QUERY_TYPE, PERMISSION_ENUM } from '../constants';

import GroupAPI from '../../api/glip/group';

import { uniqueArray } from '../../utils';
import { transform } from '../utils';
import { ErrorParser, BaseError } from '../../utils/error';
import handleData, {
  handlePartialData,
  filterGroups,
  handleGroupMostRecentPostChanged,
  // handleFavoriteGroupsChanged,
  handleHiddenGroupsChanged,
  sortFavoriteGroups,
} from './handleData';
import Permission from './permission';
import { mainLogger, err, ok, Result } from 'foundation';
import { SOCKET, SERVICE, ENTITY } from '../eventKey';
import { LAST_CLICKED_GROUP } from '../../dao/config/constants';
import ServiceCommonErrorType from '../errors/ServiceCommonErrorType';
import { extractHiddenGroupIds } from '../profile/handleData';
import _ from 'lodash';
import AccountService from '../account';
import PersonService from '../person';
import { compareName } from '../../utils/helper';

type CreateTeamOptions = {
  isPublic?: boolean;
  canAddMember?: boolean;
  canPost?: boolean;
  canAddIntegrations?: boolean;
  canPin?: boolean;
};

const GroupErrorTypes = {
  ALREADY_TAKEN: 1,
  INVALID_FIELD: 2,
  UNKNOWN: 99,
};

class GroupService extends BaseService<Group> {
  static serviceName = 'GroupService';

  constructor() {
    const subscriptions = {
      [SOCKET.GROUP]: handleData,
      [SOCKET.PARTIAL_GROUP]: handlePartialData,
      [ENTITY.POST]: handleGroupMostRecentPostChanged,
      // [SERVICE.PROFILE_FAVORITE]: handleFavoriteGroupsChanged,
      [SERVICE.PROFILE_HIDDEN_GROUP]: handleHiddenGroupsChanged,
    };
    super(GroupDao, GroupAPI, handleData, subscriptions);
    this.enableCache();
  }

  private async _getFavoriteGroups(): Promise<Group[]> {
    let result: Group[] = [];
    const profileService: ProfileService = ProfileService.getInstance();
    const profile = await profileService.getProfile();
    if (
      profile &&
      profile.favorite_group_ids &&
      profile.favorite_group_ids.length > 0
    ) {
      let favorite_group_ids = profile.favorite_group_ids.filter(
        id => typeof id === 'number' && !isNaN(id),
      );
      const hiddenIds = profile ? extractHiddenGroupIds(profile) : [];
      favorite_group_ids = _.difference(favorite_group_ids, hiddenIds);
      const dao = daoManager.getDao(GroupDao);
      result = (await dao.queryGroupsByIds(favorite_group_ids)) as Group[];
      result = sortFavoriteGroups(favorite_group_ids, result);
    }
    return result;
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
      result = await dao.queryAllGroups(offset, limit);
    } else {
      const profileService: ProfileService = ProfileService.getInstance();
      const profile = await profileService.getProfile();
      const favoriteGroupIds =
        profile && profile.favorite_group_ids ? profile.favorite_group_ids : [];
      const hiddenIds = profile ? extractHiddenGroupIds(profile) : [];
      const excludeIds = favoriteGroupIds.concat(hiddenIds);

      result = await dao.queryGroups(
        offset,
        Infinity,
        groupType === GROUP_QUERY_TYPE.TEAM,
        excludeIds,
      );
      result = await filterGroups(
        result,
        limit,
        groupType === GROUP_QUERY_TYPE.GROUP,
      );
    }
    return result;
  }
  // this function should refactor with getGroupsByType
  // we should support to get group by paging
  async getLastNGroups(n: number): Promise<Group[]> {
    mainLogger.debug(`get last ${n} groups`);
    let result: Group[] = [];
    const dao = daoManager.getDao(GroupDao);
    result = (await dao.getLastNGroups(n)) as Group[];
    return result;
  }

  async getGroupsByIds(ids: number[]): Promise<Group[]> {
    if (ids.length) {
      const groups = await Promise.all(
        ids.map(async (id: number) => {
          const group = await this.getById(id);
          return group;
        }),
      );
      return groups.filter(group => group !== null) as Group[];
    }
    return [];
  }

  async getGroupById(id: number) {
    console.warn('getGroupById() is deprecated use getById() instead.');
    return super.getById(id);
  }

  async getGroupByPersonId(personId: number): Promise<Group | null> {
    try {
      return await this.getGroupByMemberList([personId]);
    } catch (e) {
      mainLogger.error(`getGroupByPersonId error =>${e}`);
      throw ErrorParser.parse(e);
    }
  }

  async getGroupByMemberList(members: number[]): Promise<Group | null> {
    try {
      const accountService: AccountService = AccountService.getInstance();
      const userId = accountService.getCurrentUserId();
      if (userId) {
        members.push(userId);
        const mem = uniqueArray(members);
        const groupDao = daoManager.getDao(GroupDao);
        const result = await groupDao.queryGroupByMemberList(mem);
        if (result) {
          return result;
        }
        return await this.requestRemoteGroupByMemberList(mem);
      }
      return null;
    } catch (e) {
      mainLogger.error(`getGroupByMemberList error =>${e}`);
      throw ErrorParser.parse(e);
    }
  }

  async requestRemoteGroupByMemberList(
    members: number[],
  ): Promise<Group | null> {
    const info: Partial<Group> = GroupServiceHandler.buildNewGroupInfo(members);

    const result = await GroupAPI.requestNewGroup(info);
    return result.match({
      Ok: async (data: Raw<Group>) => {
        const group = transform<Group>(data);
        await handleData([data]);
        return group;
      },
      Err: (e: BaseError) => {
        mainLogger.error(
          `requestRemoteGroupByMemberList error ${JSON.stringify(e)}`,
        );
        return null;
      },
    });
  }

  async getLatestGroup(): Promise<Group | null> {
    const configDao = daoManager.getKVDao(ConfigDao);
    const groupId = configDao.get(LAST_CLICKED_GROUP);
    if (groupId) {
      return this.getById(groupId);
    }
    const groupDao = daoManager.getDao(GroupDao);
    return groupDao.getLatestGroup();
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
    const groupDao = daoManager.getDao(GroupDao);
    const group = await groupDao.get(groupId);
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

  async hasPermissionWithGroupId(
    group_id: number,
    type: PERMISSION_ENUM,
  ): Promise<boolean> {
    const groupInfo = await this.getById(group_id);
    if (groupInfo) {
      const permissionList = this.getPermissions(groupInfo);
      return permissionList.includes(type);
    }
    return false;
  }

  hasPermissionWithGroup(group: Group, type: PERMISSION_ENUM): boolean {
    const permissionList = this.getPermissions(group);
    return permissionList.includes(type);
  }

  async addTeamMembers(groupId: number, memberIds: number[]) {
    const result = await GroupAPI.addTeamMembers(groupId, memberIds);
    const rawGroup = result.expect('Failed to add team members.');
    const newGroup = await this.handleRawGroup(rawGroup);
    return newGroup;
  }

  async createTeam(
    name: string,
    creator: number,
    memberIds: (number | string)[],
    description: string,
    options: CreateTeamOptions = {},
  ): Promise<Result<Group | Raw<Group>>> {
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
    const result = await GroupAPI.createTeam(team);

    return result.match({
      Ok: async (rawGroup: Raw<Group>) => {
        const newGroup = await this.handleRawGroup(rawGroup);
        return ok(newGroup);
      },
      Err: (error: BaseError) => err(error),
    });
  }

  async reorderFavoriteGroups(oldIndex: number, newIndex: number) {
    const profileService: ProfileService = ProfileService.getInstance();
    profileService.reorderFavoriteGroups(oldIndex, newIndex);
  }

  async markGroupAsFavorite(groupId: number, markAsFavorite: boolean) {
    const profileService: ProfileService = ProfileService.getInstance();
    const result = profileService.markGroupAsFavorite(groupId, markAsFavorite);
    if (result instanceof BaseError && result.code >= 5300) {
      return ServiceCommonErrorType.SERVER_ERROR;
    }
    return ServiceCommonErrorType.NONE;
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

  async hideConversation(
    groupId: number,
    hidden: boolean,
    shouldUpdateSkipConfirmation: boolean,
  ): Promise<ServiceCommonErrorType> {
    const profileService: ProfileService = ProfileService.getInstance();
    const result = await profileService.hideConversation(
      groupId,
      hidden,
      shouldUpdateSkipConfirmation,
    );

    if (result instanceof BaseError) {
      if (result.code === 5000) {
        return ServiceCommonErrorType.NETWORK_NOT_AVAILABLE;
      }
      if (result.code > 5300) {
        return ServiceCommonErrorType.SERVER_ERROR;
      }
      return ServiceCommonErrorType.UNKNOWN_ERROR;
    }
    return ServiceCommonErrorType.NONE;
  }

  /**
   * TODO Mark the group as no more post.
   */
  // async markAsNoPost(groupId: number) {
  //   const dao: GroupDao = daoManager.getDao(GroupDao);
  //   const group = await dao.get(groupId);
  //   if (group) {
  //     group.has_no_more_post = true;
  //     await dao.update(group);
  //   }
  // }

  // update partial group data
  async updateGroupPartialData(params: object): Promise<boolean> {
    try {
      await this.handlePartialUpdate(
        params,
        undefined,
        async (updatedModel: Group) => {
          return updatedModel;
        },
      );
      return true;
    } catch (error) {
      throw ErrorParser.parse(error);
    }
  }

  // update partial group data, for message draft
  async updateGroupDraft(params: {
    id: number;
    draft: string;
  }): Promise<boolean> {
    const result = await this.updateGroupPartialData(params);
    return result;
  }

  // update partial group data, for send failure post ids
  async updateGroupSendFailurePostIds(params: {
    id: number;
    send_failure_post_ids: number[];
  }): Promise<boolean> {
    const result = await this.updateGroupPartialData(params);
    return result;
  }

  // get group data, for send failure post ids
  async getGroupSendFailurePostIds(id: number): Promise<number[]> {
    try {
      const group = (await this.getGroupById(id)) as Group;
      return group.send_failure_post_ids || [];
    } catch (error) {
      throw ErrorParser.parse(error);
    }
  }

  async doFuzzySearchGroups(
    searchKey: string,
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  } | null> {
    const accountService = AccountService.getInstance() as AccountService;
    const currentUserId = accountService.getCurrentUserId();
    if (!currentUserId) {
      return null;
    }
    return this.searchEntitiesFromCache(
      (group: Group, terms: string[]) => {
        if (this._isValidGroup(group) && group.members.length > 2) {
          const groupName = this.getGroupNameByMultiMembers(
            group.members,
            currentUserId,
          );

          if (
            (terms.length > 0 && this.isFuzzyMatched(groupName, terms)) ||
            (fetchAllIfSearchKeyEmpty && terms.length === 0)
          ) {
            return {
              id: group.id,
              displayName: groupName,
              sortKey: groupName.toLowerCase(),
              entity: group,
            };
          }
        }
        return null;
      },
      searchKey,
      undefined,
      this.sortEntitiesByName.bind(this),
    );
  }

  async doFuzzySearchTeams(
    searchKey?: string,
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  } | null> {
    const accountService = AccountService.getInstance() as AccountService;
    const currentUserId = accountService.getCurrentUserId();
    if (!currentUserId) {
      return null;
    }

    return this.searchEntitiesFromCache(
      (team: Group, terms: string[]) => {
        return this._idValidTeam(team) &&
          ((fetchAllIfSearchKeyEmpty && terms.length === 0) ||
            (terms.length > 0 &&
              this.isFuzzyMatched(team.set_abbreviation, terms))) &&
          (team.is_public ||
            team.members.find((id: number) => {
              return id === currentUserId;
            }))
          ? {
            id: team.id,
            displayName: team.set_abbreviation,
            sortKey: team.set_abbreviation.toLowerCase(),
            entity: team,
          }
          : null;
      },
      searchKey,
      undefined,
      this.sortEntitiesByName.bind(this),
    );
  }

  getGroupNameByMultiMembers(members: number[], currentUserId: number) {
    const names: string[] = [];
    const emails: string[] = [];

    const personService: PersonService = PersonService.getInstance();
    const diffMembers = _.difference(members, [currentUserId]);

    diffMembers.forEach((id: number) => {
      const person = personService.getEntityFromCache(id);
      if (person) {
        const name = personService.getName(person);
        if (name.length > 0) {
          names.push(name);
        } else {
          emails.push(person.email);
        }
      }
    });

    return names
      .sort(compareName)
      .concat(emails.sort(compareName))
      .join(', ');
  }

  private _isValidGroup(group: Group) {
    return this._isValid(group) && !group.is_team;
  }

  private _idValidTeam(group: Group) {
    return this._isValid(group) && group.is_team;
  }

  private _isValid(group: Group) {
    return !group.is_archived && !group.deactivated && group.members;
  }
}

export { CreateTeamOptions, GroupService, GroupErrorTypes };
