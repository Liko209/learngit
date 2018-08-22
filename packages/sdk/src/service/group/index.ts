/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-06 10:00:30
 */

import { daoManager } from '../../dao';
import AccountDao from '../../dao/account';
import GroupDao from '../../dao/group';
import { Group, Raw } from '../../models';
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
import { ErrorParser } from '../../utils/error';
import handleData, {
  handlePartialData,
  filterGroups,
  handleGroupMostRecentPostChanged,
  handleFavoriteGroupsChanged,
} from './handleData';
import Permission from './permission';
import { IResponse } from '../../api/NetworkClient';
import { mainLogger } from 'foundation';
import { SOCKET, SERVICE } from '../eventKey';

export type CreateTeamOptions = {
  isPublic?: boolean;
  canAddMember?: boolean;
  canPost?: boolean;
  canAddIntegrations?: boolean;
  canPin?: boolean;
};

export default class GroupService extends BaseService<Group> {
  static serviceName = 'GroupService';

  constructor() {
    const subscriptions = {
      [SOCKET.GROUP]: handleData,
      [SOCKET.PARTIAL_GROUP]: handlePartialData,
      [SOCKET.POST]: handleGroupMostRecentPostChanged,
      [SERVICE.PROFILE_FAVORITE]: handleFavoriteGroupsChanged,
    };
    super(GroupDao, GroupAPI, handleData, subscriptions);
  }

  async getGroupsByType(
    groupType = GROUP_QUERY_TYPE.ALL,
    offset = 0,
    limit = 20,
  ): Promise<Group[]> {
    mainLogger.debug(`offset:${offset} limit:${limit} groupType:${groupType}`);
    let result: Group[] = [];
    const dao = daoManager.getDao(GroupDao);
    if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
      const profileService: ProfileService = ProfileService.getInstance();
      const profile = await profileService.getProfile();
      if (
        profile &&
        profile.favorite_group_ids &&
        profile.favorite_group_ids.length > 0
      ) {
        result = (await dao.queryGroupsByIds(
          profile.favorite_group_ids,
        )) as Group[];
      }
    } else if (groupType === GROUP_QUERY_TYPE.ALL) {
      result = (await dao.queryAllGroups(offset, limit)) as Group[];
    } else {
      const profileService: ProfileService = ProfileService.getInstance();
      const profile = await profileService.getProfile();
      const favoriteGroupIds =
        profile && profile.favorite_group_ids ? profile.favorite_group_ids : [];
      result = (await dao.queryGroups(
        offset,
        Infinity,
        groupType === GROUP_QUERY_TYPE.TEAM,
        favoriteGroupIds,
      )) as Group[];
      const limitLength = groupType === GROUP_QUERY_TYPE.TEAM ? 20 : 10;
      result = await filterGroups(result, groupType, limitLength);
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

  async getGroupByPersonId(personId: number): Promise<Group[]> {
    try {
      const userId = daoManager.getKVDao(AccountDao).get(ACCOUNT_USER_ID);
      let members = [Number(personId), Number(userId)];
      members = uniqueArray(members);
      return await this.getGroupByMemberList(members);
    } catch (e) {
      mainLogger.error(`getGroupByPersonId error =>${e}`);
      return [];
    }
  }

  async getGroupByMemberList(members: number[]): Promise<Group[]> {
    try {
      const mem = uniqueArray(members);
      const groupDao = daoManager.getDao(GroupDao);
      const result = (await groupDao.queryGroupByMemberList(mem)) as Group[];
      if (result.length !== 0) {
        return result;
      }
      return await this.requestRemoteGroupByMemberList(mem);
    } catch (e) {
      mainLogger.error(`getGroupByMemberList error =>${e}`);
      return [];
    }
  }

  async requestRemoteGroupByMemberList(members: number[]): Promise<Group[]> {
    const info: Partial<Group> = GroupServiceHandler.buildNewGroupInfo(members);
    try {
      const result = await GroupAPI.requestNewGroup(info);
      if (result.data) {
        const group = transform<Group>(result.data);
        await handleData([result.data]);
        return [group];
      }
      return [];
    } catch (e) {
      mainLogger.error(
        `requestRemoteGroupByMemberList error ${JSON.stringify(e)}`,
      );
      return [];
    }
  }

  async getLatestGroup(): Promise<Group | null> {
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
  ): Promise<Group | null> {
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
  ): Promise<Group | null> {
    const resp = await GroupAPI.addTeamMembers(groupId, memberIds);
    return this.handleResponse(resp);
  }

  async createTeam(
    name: string,
    creator: number,
    memberIds: number[],
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
      const team: Partial<Group> = {
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

  async handleResponse(resp: IResponse<Raw<Group>>) {
    if (resp && resp.data) {
      const group = transform<Group>(resp.data);
      await handleData([resp.data]);
      return group;
    }

    // should handle errors when error handling ready
    return null;
  }
}
