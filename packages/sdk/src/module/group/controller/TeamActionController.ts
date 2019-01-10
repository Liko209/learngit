/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:30:31
 * Copyright © RingCentral. All rights reserved.
 */

import { Group } from '../entity';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { IRequestController } from '../../../framework/controller/interface/IRequestController';
import { Api } from '../../../api';
import { IControllerBuilder } from '../../../framework/controller/interface/IControllerBuilder';

class TeamActionController {
  constructor(
    public partialModifyController: IPartialModifyController<Group>,
    public requestController: IRequestController<Group>,
    public controllerBuilder: IControllerBuilder<Group>,
  ) {}

  isInTeam(userId: number, team: Group) {
    return (
      team && team.is_team && team.members && team.members.includes(userId)
    );
  }

  canJoinTeam(team: Group) {
    return team.privacy === 'protected';
  }

  async joinTeam(userId: number, teamId: number): Promise<Group | null> {
    return this.partialModifyController.updatePartially(
      teamId,
      (partialEntity, originalEntity) => {
        return {
          ...partialEntity,
          members: originalEntity.members.concat([userId]),
        };
      },
      async (newEntity: Group) => {
        return await this.requestAddTeamMembers(teamId, [userId]);
      },
    );
  }

  async requestAddTeamMembers(teamId: number, members: number[]) {
    return this.controllerBuilder
      .buildRequestController({
        basePath: '/add_team_members',
        networkClient: Api.glipNetworkClient,
      })
      .put({
        members,
        id: teamId,
      });
  }

  async leaveTeam(userId: number, teamId: number): Promise<Group | null> {
    return this.partialModifyController.updatePartially(
      teamId,
      (partialEntity, originalEntity) => {
        const members: number[] = originalEntity.members;
        const index = members.indexOf(userId);
        if (index > -1) {
          members.splice(index, 1);
        }
        return {
          ...partialEntity,
          members,
        };
      },
      async (updatedEntity: Group) => {
        return await this.requestRemoveTeamMembers(teamId, [userId]);
      },
    );
  }

  async requestRemoveTeamMembers(teamId: number, members: number[]) {
    return this.controllerBuilder
      .buildRequestController({
        basePath: '/remove_team_members',
        networkClient: Api.glipNetworkClient,
      })
      .put({
        members,
        id: teamId,
      });
  }
}

export { TeamActionController };
