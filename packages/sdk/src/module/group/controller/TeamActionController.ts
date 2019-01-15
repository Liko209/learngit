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
        return await this._requestUpdateTeamMembers(
          teamId,
          [userId],
          '/add_team_members',
        );
      },
    );
  }

  async leaveTeam(userId: number, teamId: number): Promise<Group | null> {
    return this.partialModifyController.updatePartially(
      teamId,
      (partialEntity, originalEntity) => {
        const members: number[] = originalEntity.members.filter(
          member => member !== userId,
        );
        return {
          ...partialEntity,
          members,
        };
      },
      async (updatedEntity: Group) => {
        return await this._requestUpdateTeamMembers(
          teamId,
          [userId],
          '/remove_team_members',
        );
      },
    );
  }

  private async _requestUpdateTeamMembers(
    teamId: number,
    members: number[],
    basePath: string,
  ) {
    return this.controllerBuilder
      .buildRequestController({
        basePath,
        networkClient: Api.glipNetworkClient,
      })
      .put({
        members,
        id: teamId,
      });
  }

  async addTeamMembers(members: number[], teamId: number) {
    return this.partialModifyController.updatePartially(
      teamId,
      (partialEntity, originalEntity) => {
        return {
          ...partialEntity,
          members: originalEntity.members.concat(members),
        };
      },
      async (updateEntity: Group) => {
        return await this._requestUpdateTeamMembers(
          teamId,
          members,
          '/add_team_members',
        );
      },
    );
  }

  async removeTeamMembers(members: number[], teamId: number) {
    return this.partialModifyController.updatePartially(
      teamId,
      (partialEntity, originalEntity) => {
        const memberSet: Set<number> = new Set(originalEntity.members);
        members.forEach((member: number) => {
          memberSet.delete(member);
        });
        return {
          ...partialEntity,
          members: Array.from(memberSet),
        };
      },
      async (updateEntity: Group) => {
        return await this._requestUpdateTeamMembers(
          teamId,
          members,
          '/remove_team_members',
        );
      },
    );
  }
}

export { TeamActionController };
