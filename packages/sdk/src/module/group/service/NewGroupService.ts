/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:27:54
 * Copyright © RingCentral. All rights reserved.
 */

import { TeamController } from '../controller/TeamController';
import { Group, TeamPermission, TeamPermissionParams } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { TeamSetting, PermissionFlags, CreateTeamOptions } from '../types';
import { PERMISSION_ENUM } from '../constants';
import { INewGroupService } from './INewGroupService';
import { PostService } from '../../../service';
import { daoManager, QUERY_DIRECTION } from '../../../dao';
import { GroupDao } from '../../../module/group/dao';
import GroupConfigDao from '../../../dao/groupConfig';
import { Api } from '../../../api';
import { GroupConfigController } from '../controller/GroupConfigController';
import { SOCKET, SERVICE, ENTITY } from '../../../service/eventKey';
import handleData, {
  handleGroupMostRecentPostChanged,
  handleHiddenGroupsChanged,
} from '../service/handleData';
import { GROUP_QUERY_TYPE } from '../../../service/constants';
import { SortableModel } from '../../../framework/model';
import { Result } from 'foundation';

const deleteAllTeamInformation = async (ids: number[]) => {
  const postService: PostService = PostService.getInstance();
  await postService.deletePostsByGroupIds(ids, true);
  const groupConfigDao = daoManager.getDao(GroupConfigDao);
  groupConfigDao.bulkDelete(ids);
};

const setAsTrue4HasMoreConfigByDirection = async (ids: number[]) => {
  const service: GroupService = GroupService.getInstance();
  service.setAsTrue4HasMoreConfigByDirection(ids, QUERY_DIRECTION.OLDER);
};

class GroupService extends EntityBaseService<Group>
  implements INewGroupService {
  static serviceName = 'GroupService';
  teamController: TeamController;
  groupConfigController: GroupConfigController;
  constructor() {
    super(true, daoManager.getDao(GroupDao), {
      basePath: '/team',
      networkClient: Api.glipNetworkClient,
    });
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.GROUP]: handleData,
        [ENTITY.POST]: handleGroupMostRecentPostChanged,
        // [SERVICE.PROFILE_FAVORITE]: handleFavoriteGroupsChanged,
        [SERVICE.PROFILE_HIDDEN_GROUP]: handleHiddenGroupsChanged,
        [SERVICE.PERSON_SERVICE.TEAMS_REMOVED_FROM]: deleteAllTeamInformation,
        [SERVICE.POST_SERVICE
          .MARK_GROUP_HAS_MORE_ODER_AS_TRUE]: setAsTrue4HasMoreConfigByDirection,
      }),
    );
  }

  protected getTeamController() {
    if (!this.teamController) {
      this.teamController = new TeamController(
        this.getEntitySource(),
        this.getEntityCacheSearchController(),
      );
    }
    return this.teamController;
  }

  protected getGroupConfigController() {
    if (!this.groupConfigController) {
      this.groupConfigController = new GroupConfigController();
    }
    return this.groupConfigController;
  }

  isValid(group: Group): boolean {
    return this.getTeamController()
      .getGroupActionController()
      .isValid(group);
  }

  isInTeam(userId: number, team: Group) {
    return this.getTeamController()
      .getTeamActionController()
      .isInTeam(userId, team);
  }

  canJoinTeam(team: Group) {
    return this.getTeamController()
      .getTeamActionController()
      .canJoinTeam(team);
  }

  async joinTeam(userId: number, teamId: number) {
    await this.getTeamController()
      .getTeamActionController()
      .joinTeam(userId, teamId);
  }

  async updateTeamSetting(teamId: number, teamSetting: TeamSetting) {
    await this.getTeamController()
      .getTeamActionController()
      .updateTeamSetting(teamId, teamSetting);
  }

  getTeamUserPermissionFlags(teamPermission: TeamPermission): PermissionFlags {
    return this.getTeamController()
      .getTeamPermissionController()
      .getTeamUserPermissionFlags(teamPermission);
  }

  async leaveTeam(userId: number, teamId: number) {
    await this.getTeamController()
      .getTeamActionController()
      .leaveTeam(userId, teamId);
  }

  async addTeamMembers(members: number[], teamId: number) {
    await this.getTeamController()
      .getTeamActionController()
      .addTeamMembers(members, teamId);
  }

  async removeTeamMembers(members: number[], teamId: number) {
    await this.getTeamController()
      .getTeamActionController()
      .removeTeamMembers(members, teamId);
  }

  isCurrentUserHasPermission(
    teamPermissionParams: TeamPermissionParams,
    type: PERMISSION_ENUM,
  ): boolean {
    return this.getTeamController()
      .getTeamPermissionController()
      .isCurrentUserHasPermission(teamPermissionParams, type);
  }

  isTeamAdmin(personId: number, permission?: TeamPermission): boolean {
    return this.getTeamController()
      .getTeamPermissionController()
      .isTeamAdmin(personId, permission);
  }

  async deleteTeam(teamId: number): Promise<void> {
    await this.getTeamController()
      .getTeamActionController()
      .deleteTeam(teamId);
  }

  hasTeamAdmin(permission?: TeamPermission): boolean {
    return this.getTeamController()
      .getTeamPermissionController()
      .hasTeamAdmin(permission);
  }

  async hasMorePostInRemote(groupId: number, direction: QUERY_DIRECTION) {
    return this.getGroupConfigController().hasMorePostInRemote(
      groupId,
      direction,
    );
  }

  updateHasMore(groupId: number, direction: QUERY_DIRECTION, hasMore: boolean) {
    return this.getGroupConfigController().updateHasMore(
      groupId,
      direction,
      hasMore,
    );
  }

  async archiveTeam(teamId: number) {
    await this.getTeamController()
      .getTeamActionController()
      .archiveTeam(teamId);
  }

  async makeAdmin(teamId: number, member: number) {
    return this.getTeamController()
      .getTeamActionController()
      .makeOrRevokeAdmin(teamId, member, true);
  }

  async revokeAdmin(teamId: number, member: number) {
    return this.getTeamController()
      .getTeamActionController()
      .makeOrRevokeAdmin(teamId, member, false);
  }

  async getGroupsByType(
    groupType: GROUP_QUERY_TYPE,
    offset: number = 0,
    _limit?: number,
  ): Promise<Group[]> {
    return await this.getTeamController()
      .getGroupActionController()
      .getGroupsByType(groupType, offset, _limit);
  }

  async getGroupsByIds(ids: number[]): Promise<Group[]> {
    return await this.getTeamController()
      .getGroupActionController()
      .getGroupsByIds(ids);
  }

  async getLocalGroup(personIds: number[]): Promise<Group | null> {
    return await this.getTeamController()
      .getGroupActionController()
      .getLocalGroup(personIds);
  }

  async getGroupByPersonId(personId: number): Promise<Result<Group>> {
    return await this.getTeamController()
      .getGroupActionController()
      .getGroupByPersonId(personId);
  }

  async getOrCreateGroupByMemberList(
    members: number[],
  ): Promise<Result<Group>> {
    return await this.getTeamController()
      .getGroupActionController()
      .getOrCreateGroupByMemberList(members);
  }

  async requestRemoteGroupByMemberList(
    members: number[],
  ): Promise<Result<Group>> {
    return await this.getTeamController()
      .getGroupActionController()
      .requestRemoteGroupByMemberList(members);
  }

  canPinPost(postId: number, group: Group): boolean {
    return this.getTeamController()
      .getGroupActionController()
      .canPinPost(postId, group);
  }

  async pinPost(
    postId: number,
    groupId: number,
    toPin: boolean,
  ): Promise<void> {
    await this.getTeamController()
      .getGroupActionController()
      .pinPost(postId, groupId, toPin);
  }

  getPermissions(group: Group): PERMISSION_ENUM[] {
    return this.getTeamController()
      .getGroupActionController()
      .getPermissions(group);
  }

  async createTeam(
    name: string,
    creator: number,
    memberIds: (number | string)[],
    description: string,
    options: CreateTeamOptions,
  ): Promise<Result<Group>> {
    return await this.getTeamController()
      .getGroupActionController()
      .createTeam(name, creator, memberIds, description, options);
  }

  async getLeftRailGroups(): Promise<Group[]> {
    return await this.getTeamController()
      .getGroupActionController()
      .getLeftRailGroups();
  }

  async updateGroupPrivacy(params: {
    id: number;
    privacy: string;
  }): Promise<void> {
    await this.getTeamController()
      .getGroupActionController()
      .updateGroupPrivacy(params);
  }

  async isFavored(id: number, type: number): Promise<boolean> {
    return await this.getTeamController()
      .getGroupActionController()
      .isFavored(id, type);
  }

  async doFuzzySearchGroups(
    searchKey: string,
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  } | null> {
    return await this.getTeamController()
      .getGroupActionController()
      .doFuzzySearchGroups(searchKey, fetchAllIfSearchKeyEmpty);
  }

  async doFuzzySearchTeams(
    searchKey?: string,
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  } | null> {
    return await this.getTeamController()
      .getGroupActionController()
      .doFuzzySearchTeams(searchKey, fetchAllIfSearchKeyEmpty);
  }

  async getGroupEmail(groupId: number): Promise<string> {
    return await this.getTeamController()
      .getGroupActionController()
      .getGroupEmail(groupId);
  }

  async setAsTrue4HasMoreConfigByDirection(
    ids: number[],
    direction: QUERY_DIRECTION,
  ): Promise<void> {
    return await this.getTeamController()
      .getGroupActionController()
      .setAsTrue4HasMoreConfigByDirection(ids, direction);
  }

  // update partial group data, for last accessed time
  async updateGroupLastAccessedTime(params: {
    id: number;
    timestamp: number;
  }): Promise<boolean> {
    return await this.getTeamController()
      .getGroupActionController()
      .updateGroupLastAccessedTime(params);
  }

  async isGroupCanBeShown(groupId: number): Promise<boolean> {
    return await this.getTeamController()
      .getGroupActionController()
      .isGroupCanBeShown(groupId);
  }
}

export { GroupService };
