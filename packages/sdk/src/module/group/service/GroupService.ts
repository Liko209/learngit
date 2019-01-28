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
import { IGroupService } from './IGroupService';
import { daoManager, GroupDao } from '../../../dao';
import { Api } from '../../../api';

class GroupService extends EntityBaseService<Group> implements IGroupService {
  teamController: TeamController;
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
    return this.getTeamController()
      .getTeamActionController()
      .deleteTeam(teamId);
  }
}

export { GroupService };
