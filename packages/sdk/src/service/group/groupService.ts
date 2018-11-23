/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 09:56:16
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager, ConfigDao } from '../../dao';
import AccountDao from '../../dao/account';
import GroupDao from '../../dao/group';
import {
  Group,
  GroupApiType,
  Raw,
  IResponseError,
  SortableModel,
} from '../../models';
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
import { IResponse } from '../../api/NetworkClient';
import { mainLogger } from 'foundation';
import { SOCKET, SERVICE, ENTITY } from '../eventKey';
import { LAST_CLICKED_GROUP } from '../../dao/config/constants';
import ServiceCommonErrorType from '../errors/ServiceCommonErrorType';
import { extractHiddenGroupIds } from '../profile/handleData';
import TypeDictionary from '../../utils/glip-type-dictionary/types';
import _ from 'lodash';
import { AccountService } from '../account/accountService';
import PersonService from '../person';
import { compareName } from '../../utils/helper';

type CreateTeamOptions = {
  isPublic?: boolean;
  canAddMember?: boolean;
  canPost?: boolean;
  canAddIntegrations?: boolean;
  canPin?: boolean;
};

enum FEATURE_ACTION_STATUS {
  INVISIBLE,
  ENABLE,
  DISABLE,
}

enum FEATURE_TYPE {
  MESSAGE,
  CALL,
  VIDEO,
  CONFERENCE,
}

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
    this.setSupportCache(true);
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
      const groups = (await Promise.all(
        ids.map(async (id: number) => {
          const group = await this.getById(id);
          return group;
        }),
      )) as (Group | null)[];
      return groups.filter(group => group !== null) as Group[];
    }
    return [];
  }

  async getGroupById(id: number): Promise<Group | null> {
    console.warn('getGroupById() is deprecated use getById() instead.');
    return super.getById(id) as Promise<Group | null>;
  }

  async getLocalGroupByMemberIdList(ids: number[]): Promise<Group | null> {
    try {
      const mem = uniqueArray(ids);
      const groupDao = daoManager.getDao(GroupDao);
      const result = await groupDao.queryGroupByMemberList(mem);
      if (result) {
        return result;
      }
      return null;
    } catch (e) {
      mainLogger.error(`getLocalGroupByMemberIdList error =>${e}`);
      return null;
    }
  }

  async getGroupByPersonId(personId: number): Promise<Group | null> {
    try {
      const userId = daoManager.getKVDao(AccountDao).get(ACCOUNT_USER_ID);
      const members = [Number(personId), Number(userId)];
      return await this.getOrCreateGroupByMemberList(members);
    } catch (e) {
      mainLogger.error(`getGroupByPersonId error =>${e}`);
      return null;
    }
  }

  async getOrCreateGroupByMemberList(members: number[]): Promise<Group | null> {
    try {
      const uniqueMem = uniqueArray(members);
      const result = await this.getLocalGroupByMemberIdList(uniqueMem);
      if (result) {
        return result;
      }
      return await this.requestRemoteGroupByMemberList(uniqueMem);
    } catch (e) {
      mainLogger.error(`getOrCreateGroupByMemberList error =>${e}`);
      return null;
    }
  }

  async requestRemoteGroupByMemberList(
    members: number[],
  ): Promise<Group | null> {
    const info: Partial<Group> = GroupServiceHandler.buildNewGroupInfo(members);
    try {
      const result = await GroupAPI.requestNewGroup(info);
      if (result.data) {
        const group = transform<Group>(result.data);
        await handleData([result.data]);
        return group;
      }
      return null;
    } catch (e) {
      mainLogger.error(
        `requestRemoteGroupByMemberList error ${JSON.stringify(e)}`,
      );
      return null;
    }
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

  async pinPost(
    postId: number,
    groupId: number,
    toPin: boolean,
  ): Promise<Group | IResponseError | null> {
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
      const response = await GroupAPI.pinPost(path, group);
      return this.handleResponse(response);
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
    const permissionList = this.getPermissions(groupInfo);
    return permissionList.includes(type);
  }

  hasPermissionWithGroup(group: Group, type: PERMISSION_ENUM): boolean {
    const permissionList = this.getPermissions(group);
    return permissionList.includes(type);
  }

  async addTeamMembers(
    groupId: number,
    memberIds: number[],
  ): Promise<Group | IResponseError | null> {
    const resp = await GroupAPI.addTeamMembers(groupId, memberIds);
    return this.handleResponse(resp);
  }

  async createTeam(
    name: string,
    creator: number,
    memberIds: (number | string)[],
    description: string,
    options: CreateTeamOptions = {},
  ) {
    try {
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
      const resp = await GroupAPI.createTeam(team);
      return this.handleResponse(resp);
    } catch (error) {
      throw ErrorParser.parse(error);
    }
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

  async handleResponse(resp: IResponse<Raw<Group>>) {
    if (resp && resp.data && resp.data.error) {
      return resp.data;
    }
    const group = transform<Group>(resp.data);
    await handleData([resp.data]);
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

  async buildGroupFeatureActionMap(
    groupId: number,
  ): Promise<Map<FEATURE_TYPE, FEATURE_ACTION_STATUS>> {
    try {
      const actionMap = new Map<FEATURE_TYPE, FEATURE_ACTION_STATUS>();
      actionMap.set(FEATURE_TYPE.CALL, FEATURE_ACTION_STATUS.INVISIBLE); // can not make call in group

      const group = (await this.getGroupById(groupId)) as Group;
      actionMap.set(
        FEATURE_TYPE.MESSAGE,
        group
          ? this._checkGroupMessageStatus(group)
          : FEATURE_ACTION_STATUS.INVISIBLE,
      );

      // To-Do
      actionMap.set(FEATURE_TYPE.CONFERENCE, FEATURE_ACTION_STATUS.INVISIBLE); // can not make conference in group for nwo
      actionMap.set(FEATURE_TYPE.VIDEO, FEATURE_ACTION_STATUS.INVISIBLE); // can not make video in group for now
      return actionMap;
    } catch (error) {
      throw ErrorParser.parse(error);
    }
  }

  async isFavorited(id: number, type: number): Promise<boolean> {
    let groupId: number | undefined = undefined;
    switch (type) {
      case TypeDictionary.TYPE_ID_PERSON: {
        const group = await this.getLocalGroupByMemberIdList([id]);
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
        mainLogger.error('isFavorited : should not run to here');
      }
    }

    if (groupId) {
      return await this._isGroupFavorited(groupId);
    }

    return false;
  }

  private async _isGroupFavorited(groupId: number): Promise<boolean> {
    const profileService: ProfileService = ProfileService.getInstance();
    const profile = await profileService.getProfile();
    const favoriteGroupIds = profile ? profile.favorite_group_ids || [] : [];
    return favoriteGroupIds.some((x: number) => groupId === x);
  }

  private _checkGroupMessageStatus(group: Group) {
    return this._isCurrentUserInGroup(group)
      ? FEATURE_ACTION_STATUS.ENABLE
      : FEATURE_ACTION_STATUS.INVISIBLE;
  }

  private _isCurrentUserInGroup(group: Group) {
    const userId = daoManager.getKVDao(AccountDao).get(ACCOUNT_USER_ID);
    return group ? group.members.some((x: number) => x === userId) : false;
  }

  async doFuzzySearchGroups(
    searchKey: string,
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
        if (
          !group.is_team &&
          !group.is_archived &&
          !group.deactivated &&
          group.members &&
          group.members.length > 2
        ) {
          const groupName = this.getGroupNameByMultiMembers(
            group.members,
            currentUserId,
          );

          if (this.isFuzzyMatched(groupName, terms)) {
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
    searchKey: string,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  } | null> {
    return this.searchEntitiesFromCache(
      (group: Group, terms: string[]) => {
        if (group.is_team && !group.is_archived && !group.deactivated) {
          if (this.isFuzzyMatched(group.set_abbreviation, terms)) {
            return {
              id: group.id,
              displayName: group.set_abbreviation,
              sortKey: group.set_abbreviation.toLowerCase(),
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
}

export { CreateTeamOptions, FEATURE_ACTION_STATUS, FEATURE_TYPE, GroupService };
