/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:27:54
 * Copyright © RingCentral. All rights reserved.
 */
import { Api } from '../../../api';
import { daoManager, QUERY_DIRECTION } from '../../../dao';
import { buildPartialModifyController } from '../../../framework/controller';
import { PartialModifyController } from '../../../framework/controller/impl/PartialModifyController';
import { Raw, SortableModel } from '../../../framework/model';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { GroupDao } from '../../../module/group/dao';
import { GROUP_QUERY_TYPE } from '../../../service/constants';
import { ENTITY, SERVICE, SOCKET } from '../../../service/eventKey';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { PERMISSION_ENUM } from '../constants';
import { GroupConfigController } from '../controller/GroupConfigController';
import { GroupController } from '../controller/GroupController';
import { Group, TeamPermission, TeamPermissionParams } from '../entity';
import { PermissionFlags, TeamSetting } from '../types';
import { IGroupService } from './IGroupService';
import { NotificationEntityUpdatePayload } from '../../../service/notificationCenter';
import { Post } from '../../post/entity';

class GroupService extends EntityBaseService<Group> implements IGroupService {
  static serviceName = 'GroupService';
  partialModifyController: PartialModifyController<Group>;
  groupController: GroupController;
  groupConfigController: GroupConfigController;
  constructor() {
    super(true, daoManager.getDao(GroupDao), {
      basePath: '/team',
      networkClient: Api.glipNetworkClient,
    });
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.GROUP]: this.handleData,
        [`${ENTITY.POST}.*`]: this.handleGroupMostRecentPostChanged,
        [SERVICE.PERSON_SERVICE.TEAMS_REMOVED_FROM]: this
          .deleteAllTeamInformation,
        [SERVICE.POST_SERVICE.MARK_GROUP_HAS_MORE_ODER_AS_TRUE]: this
          .setAsTrue4HasMoreConfigByDirection,
      }),
    );
  }

  protected getPartialModifyController() {
    if (!this.partialModifyController) {
      this.partialModifyController = buildPartialModifyController<Group>(
        this.getEntitySource(),
      );
    }
    return this.partialModifyController;
  }

  protected getGroupController() {
    if (!this.groupController) {
      this.groupController = new GroupController(
        this,
        this.getEntitySource(),
        this.getEntityCacheSearchController(),
        this.getPartialModifyController(),
      );
    }
    return this.groupController;
  }

  protected getGroupConfigController() {
    if (!this.groupConfigController) {
      this.groupConfigController = new GroupConfigController();
    }
    return this.groupConfigController;
  }

  handleData = async (groups: Raw<Group>[]): Promise<void> => {
    await this.getGroupController()
      .getHandleDataController()
      .handleData(groups);
  }

  handleGroupMostRecentPostChanged = async (
    payload: NotificationEntityUpdatePayload<Post>,
  ) => {
    await this.getGroupController()
      .getHandleDataController()
      .handleGroupMostRecentPostChanged(payload);
  }

  deleteAllTeamInformation = async (ids: number[]) => {
    await this.getGroupController()
      .getGroupActionController()
      .deleteAllTeamInformation(ids);
  }

  isValid(group: Group): boolean {
    return !group.is_archived && !group.deactivated && !!group.members;
  }

  isInTeam(userId: number, team: Group) {
    return this.getGroupController()
      .getGroupActionController()
      .isInTeam(userId, team);
  }

  canJoinTeam(team: Group) {
    return this.getGroupController()
      .getGroupActionController()
      .canJoinTeam(team);
  }

  async joinTeam(userId: number, teamId: number) {
    await this.getGroupController()
      .getGroupActionController()
      .joinTeam(userId, teamId);
  }

  async updateTeamSetting(teamId: number, teamSetting: TeamSetting) {
    await this.getGroupController()
      .getGroupActionController()
      .updateTeamSetting(teamId, teamSetting);
  }

  getTeamUserPermissionFlags(teamPermission: TeamPermission): PermissionFlags {
    return this.getGroupController()
      .getTeamPermissionController()
      .getTeamUserPermissionFlags(teamPermission);
  }

  async leaveTeam(userId: number, teamId: number) {
    await this.getGroupController()
      .getGroupActionController()
      .leaveTeam(userId, teamId);
  }

  async addTeamMembers(members: number[], teamId: number) {
    await this.getGroupController()
      .getGroupActionController()
      .addTeamMembers(members, teamId);
  }

  async removeTeamMembers(members: number[], teamId: number) {
    await this.getGroupController()
      .getGroupActionController()
      .removeTeamMembers(members, teamId);
  }

  isCurrentUserHasPermission(
    type: PERMISSION_ENUM,
    teamPermissionParams: TeamPermissionParams,
  ): boolean {
    return this.getGroupController()
      .getTeamPermissionController()
      .isCurrentUserHasPermission(type, teamPermissionParams);
  }

  isTeamAdmin(personId: number, permission?: TeamPermission): boolean {
    return this.getGroupController()
      .getTeamPermissionController()
      .isTeamAdmin(personId, permission);
  }

  async deleteTeam(teamId: number): Promise<void> {
    await this.getGroupController()
      .getGroupActionController()
      .deleteTeam(teamId);
  }

  hasTeamAdmin(permission?: TeamPermission): boolean {
    return this.getGroupController()
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
    await this.getGroupController()
      .getGroupActionController()
      .archiveTeam(teamId);
  }

  async makeAdmin(teamId: number, member: number) {
    return this.getGroupController()
      .getGroupActionController()
      .makeOrRevokeAdmin(teamId, member, true);
  }

  async revokeAdmin(teamId: number, member: number) {
    return this.getGroupController()
      .getGroupActionController()
      .makeOrRevokeAdmin(teamId, member, false);
  }

  async getGroupsByType(
    groupType: GROUP_QUERY_TYPE,
    offset: number = 0,
    _limit?: number,
  ): Promise<Group[]> {
    return await this.getGroupController()
      .getGroupFetchDataController()
      .getGroupsByType(groupType, offset, _limit);
  }

  async getGroupsByIds(ids: number[]): Promise<Group[]> {
    return await this.getGroupController()
      .getGroupFetchDataController()
      .getGroupsByIds(ids);
  }

  async getLocalGroup(personIds: number[]): Promise<Group | null> {
    return await this.getGroupController()
      .getGroupFetchDataController()
      .getLocalGroup(personIds);
  }

  async getOrCreateGroupByMemberList(members: number[]): Promise<Group> {
    return await this.getGroupController()
      .getGroupFetchDataController()
      .getOrCreateGroupByMemberList(members);
  }

  async pinPost(
    postId: number,
    groupId: number,
    toPin: boolean,
  ): Promise<void> {
    await this.getGroupController()
      .getGroupActionController()
      .pinPost(postId, groupId, toPin);
  }

  async createTeam(
    creator: number,
    memberIds: (number | string)[],
    options: TeamSetting,
  ): Promise<Group> {
    return await this.getGroupController()
      .getGroupActionController()
      .createTeam(creator, memberIds, options);
  }

  async getLeftRailGroups(): Promise<Group[]> {
    return await this.getGroupController()
      .getGroupFetchDataController()
      .getLeftRailGroups();
  }

  async updateGroupPrivacy(params: {
    id: number;
    privacy: string;
  }): Promise<void> {
    await this.getGroupController()
      .getGroupActionController()
      .updateGroupPrivacy(params);
  }

  async isFavored(id: number, type: number): Promise<boolean> {
    return await this.getGroupController()
      .getGroupFetchDataController()
      .isFavored(id, type);
  }

  async doFuzzySearchGroups(
    searchKey: string,
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  } | null> {
    return await this.getGroupController()
      .getGroupFetchDataController()
      .doFuzzySearchGroups(searchKey, fetchAllIfSearchKeyEmpty);
  }

  async doFuzzySearchTeams(
    searchKey?: string,
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  } | null> {
    return await this.getGroupController()
      .getGroupFetchDataController()
      .doFuzzySearchTeams(searchKey, fetchAllIfSearchKeyEmpty);
  }

  async getGroupEmail(groupId: number): Promise<string> {
    return await this.getGroupController()
      .getGroupFetchDataController()
      .getGroupEmail(groupId);
  }

  setAsTrue4HasMoreConfigByDirection = async (
    ids: number[],
    direction: QUERY_DIRECTION,
  ): Promise<void> => {
    return await this.getGroupController()
      .getGroupActionController()
      .setAsTrue4HasMoreConfigByDirection(ids, direction);
  }

  // update partial group data, for last accessed time
  async updateGroupLastAccessedTime(params: {
    id: number;
    timestamp: number;
  }): Promise<boolean> {
    return await this.getGroupController()
      .getGroupActionController()
      .updateGroupLastAccessedTime(params);
  }

  async isGroupCanBeShown(groupId: number): Promise<boolean> {
    return await this.getGroupController()
      .getGroupActionController()
      .isGroupCanBeShown(groupId);
  }

  async deleteGroupsConfig(ids: number[]): Promise<void> {
    await this.getGroupConfigController().deleteGroupsConfig(ids);
  }
}

export { GroupService };
