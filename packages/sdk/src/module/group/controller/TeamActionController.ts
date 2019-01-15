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

  isInTeam(userId: number, team: Group): boolean {
    return !!(
      team &&
      team.is_team &&
      team.members &&
      team.members.includes(userId)
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
        return await this.addTeamMembers(teamId, [userId]);
      },
    );
  }

  async addTeamMembers(teamId: number, members: number[]) {
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
}

export { TeamActionController };
