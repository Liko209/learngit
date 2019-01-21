/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:30:31
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { Api } from '../../../api';
import { JSdkError, ERROR_CODES_SDK } from '../../../error';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { Group } from '../entity';
import { TeamSetting, PermissionFlags } from '../types';
import { TeamPermissionController } from './TeamPermissionController';
import { buildRequestController } from '../../../framework/controller';

class TeamActionController {
  constructor(
    public partialModifyController: IPartialModifyController<Group>,
    public entitySourceController: IEntitySourceController<Group>,
    public teamPermissionController: TeamPermissionController,
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
    return await this.partialModifyController.updatePartially(
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
    return await this.partialModifyController.updatePartially(
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

  async removeTeamMembers(members: number[], teamId: number) {
    return await this.partialModifyController.updatePartially(
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

  async addTeamMembers(members: number[], teamId: number) {
    return await this.partialModifyController.updatePartially(
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

  async getTeamSetting(teamId: number): Promise<TeamSetting> {
    const team = await this.entitySourceController.get(teamId);
    if (!team) {
      throw new JSdkError(
        ERROR_CODES_SDK.MODEL_NOT_FOUND,
        `Team id:${teamId} is not founded!`,
      );
    }
    const teamSetting = {
      name: team.set_abbreviation,
      description: team.description,
      isPublic: team.privacy === 'protected',
      permissionFlags: this.teamPermissionController.getTeamUserPermissionFlags(
        team,
      ),
    };
    return teamSetting;
  }

  async updateTeamSetting(teamId: number, teamSetting: TeamSetting) {
    await this.partialModifyController.updatePartially(
      teamId,
      (partialEntity, originalEntity) => {
        return this._teamSetting2partialTeam(
          teamSetting,
          originalEntity,
          partialEntity,
        );
      },
      async (updateEntity: Group) => {
        return await buildRequestController<Group>({
          basePath: '/team',
          networkClient: Api.glipNetworkClient,
        }).put(updateEntity);
      },
    );
  }

  private async _requestUpdateTeamMembers(
    teamId: number,
    members: number[],
    basePath: string,
  ) {
    return buildRequestController<Group>({
      basePath,
      networkClient: Api.glipNetworkClient,
    }).put({
      members,
      id: teamId,
    });
  }

  private _teamSetting2partialTeam(
    teamSetting: TeamSetting,
    originalEntity: Group,
    partialEntity: Partial<Group>,
  ) {
    const transformMap: { [key in keyof TeamSetting]: Function } = {
      name: (value: string) => (partialEntity.set_abbreviation = value),
      description: (value: string) => (partialEntity.description = value),
      isPublic: (value: boolean) =>
        (partialEntity.privacy = value ? 'protected' : 'private'),
      permissionFlags: (permissionFlags: PermissionFlags) => {
        const permissions = originalEntity.permissions || { user: {} };
        const level = this.teamPermissionController.getTeamUserLevel(
          originalEntity,
        );
        const mergeLevel = this.teamPermissionController.mergePermissionFlagsWithLevel(
          permissionFlags,
          level,
        );
        if (mergeLevel !== level) {
          _.merge(
            partialEntity,
            { permissions },
            {
              permissions: {
                user: { level: mergeLevel },
              },
            },
          );
        }
      },
    };
    _.each(teamSetting, (value: any, key: string) => {
      transformMap[key] && transformMap[key](value);
    });

    return partialEntity;
  }
}

export { TeamActionController };
