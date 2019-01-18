/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:27:54
 * Copyright © RingCentral. All rights reserved.
 */

import { TeamController } from '../controller/TeamController';
import { Group, TeamPermission } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { PERMISSION_ENUM } from '../constants';
import { IGroupService } from './IGroupService';
import { daoManager, GroupDao } from '../../../dao';
import { Api } from '../../../api';

class GroupService extends EntityBaseService<Group> implements IGroupService {
  teamController: TeamController;
  constructor() {
    super(true, daoManager.getDao(GroupDao), {
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

  async isCurrentUserHasPermission(
    groupId: number,
    type: PERMISSION_ENUM,
  ): Promise<boolean> {
    const group = await this.getById(groupId);
    return group
      ? this.getTeamController()
          .getTeamPermissionController()
          .isCurrentUserHasPermission(group, type)
      : false;
  }

  isTeamAdmin(personId: number, permission?: TeamPermission): boolean {
    return this.getTeamController()
      .getTeamPermissionController()
      .isTeamAdmin(personId, permission);
  }
}

export { GroupService };
