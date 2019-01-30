/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:27:54
 * Copyright © RingCentral. All rights reserved.
 */

import { TeamController } from '../controller/TeamController';
import { Group, TeamPermission, TeamPermissionParams } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { TeamSetting, PermissionFlags } from '../types';
import { PERMISSION_ENUM } from '../constants';
import { INewGroupService } from './INewGroupService';
import { daoManager, GroupDao, QUERY_DIRECTION } from '../../../dao';
import { Api } from '../../../api';
import { GroupConfigController } from '../controller/GroupConfigController';

class NewGroupService extends EntityBaseService<Group>
  implements INewGroupService {
  static serviceName = 'NewGroupService';
  teamController: TeamController;
  groupConfigController: GroupConfigController;
  constructor() {
    super(false, daoManager.getDao(GroupDao), {
      basePath: '/team',
      networkClient: Api.glipNetworkClient,
    });
  }

  protected getTeamController() {
    if (!this.teamController) {
      this.teamController = new TeamController(this.getEntitySource());
    }
    return this.teamController;
  }

  protected getGroupConfigController() {
    if (!this.groupConfigController) {
      this.groupConfigController = new GroupConfigController();
    }
    return this.groupConfigController;
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
}

export { NewGroupService };
