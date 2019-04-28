/*
 * @Author: Paynter Chen
 * @Date: 2019-02-02 16:16:43
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { mainLogger } from 'foundation';

import { Api } from '../../../api';
import GroupAPI from '../../../api/glip/group';
import { daoManager, QUERY_DIRECTION } from '../../../dao';
import { GroupConfigDao } from '../../groupConfig/dao';
import { ErrorParserHolder } from '../../../error';
import { buildRequestController } from '../../../framework/controller';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { IRequestController } from '../../../framework/controller/interface/IRequestController';
import { Raw } from '../../../framework/model';
import { GroupApiType } from '../../../models';
import { ENTITY } from '../../../service/eventKey';
import notificationCenter from '../../../service/notificationCenter';
import { PostService } from '../../post';
import { transform } from '../../../service/utils';
import { GroupDao } from '../dao';
import { Group } from '../entity';
import { IGroupService } from '../service/IGroupService';
import {
  PermissionFlags,
  TeamSetting,
  GroupCanBeShownResponse,
} from '../types';
import { TeamPermissionController } from './TeamPermissionController';
import { GROUP_CAN_NOT_SHOWN_REASON } from '../constants';
import { AccountUserConfig } from '../../../module/account/config';
import { ServiceConfig, ServiceLoader } from '../../serviceLoader';

export class GroupActionController {
  teamRequestController: IRequestController<Group>;
  groupRequestController: IRequestController<Group>;

  constructor(
    public groupService: IGroupService,
    public entitySourceController: IEntitySourceController<Group>,
    public partialModifyController: IPartialModifyController<Group>,
    public teamPermissionController: TeamPermissionController,
  ) {}

  isInTeam(userId: number, team: Group): boolean {
    return !!(team && team.is_team && this.isInGroup(userId, team));
  }

  isInGroup(userId: number, team: Group): boolean {
    return !!(team && team.members && team.members.includes(userId));
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
          (member: number) => member !== userId,
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
        return await this._getTeamRequestController().put(updateEntity);
      },
    );
  }

  async archiveTeam(teamId: number) {
    await this.partialModifyController.updatePartially(
      teamId,
      (partialEntity, originalEntity) => {
        return {
          ...partialEntity,
          is_archived: true,
        };
      },
      async (updateEntity: Group) => {
        return await this._getTeamRequestController().put(updateEntity);
      },
    );
  }

  async deleteTeam(teamId: number): Promise<void> {
    await this.partialModifyController.updatePartially(
      teamId,
      (partialEntity, originalEntity) => {
        return {
          ...partialEntity,
          deactivated: true,
        };
      },
      async (updateEntity: Group) => {
        return await this._getTeamRequestController().put(updateEntity);
      },
    );
  }

  async deleteGroup(groupId: number): Promise<void> {
    await this.partialModifyController.updatePartially(
      groupId,
      (partialEntity, originalEntity) => {
        return {
          ...partialEntity,
          deactivated: true,
        };
      },
      async (updateEntity: Group) => {
        return await this._getGroupRequestController().put(updateEntity);
      },
    );
  }

  async makeOrRevokeAdmin(teamId: number, member: number, isMake: boolean) {
    await this.partialModifyController.updatePartially(
      teamId,
      (partialEntity, originalEntity: Group) => {
        const permissions = originalEntity.permissions
          ? _.cloneDeep(originalEntity.permissions)
          : {};
        if (isMake) {
          if (permissions.admin) {
            permissions.admin.uids = _.union(permissions.admin.uids, [member]);
          } else {
            permissions.admin = { uids: [member] };
          }
        } else {
          if (permissions.admin) {
            permissions.admin.uids = _.difference(permissions.admin.uids, [
              member,
            ]);
          }
        }
        return {
          ...partialEntity,
          permissions,
        };
      },
      async (updateEntity: Group) => {
        return await this._getTeamRequestController().put(updateEntity);
      },
    );
  }

  async pinPost(postId: number, groupId: number, toPin: boolean) {
    await this.partialModifyController.updatePartially(
      groupId,
      (partialEntity, originalEntity) => {
        const modifiedAt = Date.now();
        const { pinned_post_ids = [] } = originalEntity;
        if (toPin) {
          return {
            ...partialEntity,
            pinned_post_ids: _.union([postId], pinned_post_ids),
            modified_at: modifiedAt,
          };
        }
        return {
          ...partialEntity,
          pinned_post_ids: _.difference(pinned_post_ids, [postId]),
          modified_at: modifiedAt,
        };
      },
      async (updateEntity: Group) => {
        const partialModel = {
          _id: updateEntity.id || updateEntity._id,
          pinned_post_ids: updateEntity.pinned_post_ids,
          modified_at: updateEntity.modified_at,
        };
        if (updateEntity.is_team) {
          return await this._getTeamRequestController().put(partialModel);
        }
        return await this._getGroupRequestController().put(partialModel);
      },
    );
  }

  async createTeam(
    creator: number,
    memberIds: (number | string)[],
    teamSetting: TeamSetting = {},
  ): Promise<Group> {
    const team = this._generateTeamParameters(creator, memberIds, teamSetting);
    const result = await GroupAPI.createTeam(team);
    return await this.handleRawGroup(result);
  }

  async convertToTeam(
    groupId: number,
    memberIds: number[],
    teamSetting: TeamSetting = {},
  ): Promise<Group> {
    const userConfig = new AccountUserConfig();
    const currentUserId = userConfig.getGlipUserId();
    const team: Partial<GroupApiType> = this._generateTeamParameters(
      currentUserId,
      memberIds,
      teamSetting,
    );
    team['group_id'] = groupId;
    const result = await GroupAPI.convertToTeam(team);
    const group = await this.handleRawGroup(result);

    try {
      // delete group;
      // if delete group failed, convert to team should still be success
      await this.deleteGroup(groupId);
    } catch (err) {
      mainLogger
        .tags('GroupActionController')
        .info(`convert to team, delete group ${groupId} fail`, err);
    }

    return group;
  }

  async handleRawGroup(rawGroup: Raw<Group>): Promise<Group> {
    const group = transform<Group>(rawGroup);
    return group;
  }

  // update partial group data
  async updateGroupPartialData(params: Partial<Group>): Promise<boolean> {
    try {
      await this.partialModifyController.updatePartially(
        params.id || 0,
        (partialEntity, originEntity) => {
          return {
            ...partialEntity,
            ...params,
          };
        },
        async (updatedModel: Group) => {
          return updatedModel;
        },
      );
      return true;
    } catch (error) {
      throw ErrorParserHolder.getErrorParser().parse(error);
    }
  }

  async updateGroupPrivacy(params: {
    id: number;
    privacy: string;
  }): Promise<void> {
    await this.partialModifyController.updatePartially(
      params.id,
      (partialEntity: Partial<Group>, originEntity: Group) => {
        return { ...partialEntity, privacy: params.privacy };
      },
      async (updateEntity: Group) =>
        await this._getGroupRequestController().put(updateEntity),
    );
  }

  // update partial group data, for last accessed time
  async updateGroupLastAccessedTime(params: {
    id: number;
    timestamp: number;
  }): Promise<boolean> {
    const { id, timestamp } = params;
    const result = await this.updateGroupPartialData({
      id,
      __last_accessed_at: timestamp,
    });
    return result;
  }

  async removeTeamsByIds(ids: number[], shouldNotify: boolean) {
    if (_.isEmpty(ids)) {
      return;
    }
    const dao = daoManager.getDao(GroupDao);
    await dao.bulkDelete(ids);
    if (shouldNotify) {
      notificationCenter.emitEntityDelete(ENTITY.GROUP, ids);
    }
  }

  deleteAllTeamInformation = async (ids: number[]) => {
    const postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );
    await postService.deletePostsByGroupIds(ids, true);
    await this.groupService.deleteGroupsConfig(ids);
    const groups = await this.entitySourceController.getEntitiesLocally(
      ids,
      false,
    );
    const privateGroupIds = groups
      .filter((group: Group) => {
        return group.privacy === 'private';
      })
      .map((group: Group) => group.id);
    await this.removeTeamsByIds(privateGroupIds, true);
  }

  async setAsTrue4HasMoreConfigByDirection(
    ids: number[],
    direction: QUERY_DIRECTION,
  ): Promise<void> {
    if (!ids.length) {
      return;
    }
    const data: any = [];
    ids.forEach((id: number) => {
      const config = {
        id,
      };
      if (direction === QUERY_DIRECTION.OLDER) {
        config['has_more_older'] = true;
      } else {
        config['has_more_newer'] = true;
      }
      data.push(config);
    });
    const groupConfigDao = daoManager.getDao(GroupConfigDao);
    groupConfigDao.bulkUpdate(data);
  }

  async isGroupCanBeShown(groupId: number): Promise<GroupCanBeShownResponse> {
    let isIncludeSelf = false;
    let isValid = false;
    let group;
    try {
      group = await this.entitySourceController.get(groupId);
    } catch (err) {
      group = null;
      mainLogger
        .tags('GroupActionController')
        .info(`get group ${groupId} fail`, err);
    }

    const result: GroupCanBeShownResponse = { canBeShown: false };
    if (!group) {
      result.reason = GROUP_CAN_NOT_SHOWN_REASON.UNKNOWN;
      return result;
    }

    isValid = this.groupService.isValid(group);
    const userConfig = new AccountUserConfig();
    const currentUserId = userConfig.getGlipUserId();
    isIncludeSelf = group.members.includes(currentUserId);

    if (!isValid) {
      if (group.deactivated) {
        result.reason = GROUP_CAN_NOT_SHOWN_REASON.DEACTIVATED;
      } else if (group.is_archived) {
        result.reason = GROUP_CAN_NOT_SHOWN_REASON.ARCHIVED;
      } else {
        result.reason = GROUP_CAN_NOT_SHOWN_REASON.UNKNOWN;
      }
    } else if (!isIncludeSelf) {
      result.reason = GROUP_CAN_NOT_SHOWN_REASON.NOT_INCLUDE_SELF;
    } else {
      result.canBeShown = true;
    }
    return result;
  }

  private _generateTeamParameters(
    creatorId: number,
    memberIds: (number | string)[],
    teamSetting: TeamSetting = {},
  ) {
    const {
      isPublic = false,
      name,
      description,
      permissionFlags = {},
    } = teamSetting;
    const privacy = isPublic ? 'protected' : 'private';
    const permissionLevel = this.teamPermissionController.mergePermissionFlagsWithLevel(
      permissionFlags,
      0,
    );
    const members = memberIds.includes(creatorId)
      ? memberIds
      : memberIds.concat(creatorId);
    const team: Partial<GroupApiType> = {
      privacy,
      description,
      members,
      set_abbreviation: name,
      permissions: {
        admin: {
          uids: [creatorId],
        },
        user: {
          uids: [],
          level: permissionLevel,
        },
      },
    };
    return team;
  }

  private _getGroupRequestController() {
    if (!this.groupRequestController) {
      this.groupRequestController = buildRequestController<Group>({
        basePath: '/group',
        networkClient: Api.glipNetworkClient,
      });
    }
    return this.groupRequestController;
  }

  private _getTeamRequestController() {
    if (!this.teamRequestController) {
      this.teamRequestController = buildRequestController<Group>({
        basePath: '/team',
        networkClient: Api.glipNetworkClient,
      });
    }
    return this.teamRequestController;
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
          originalEntity.permissions,
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

  isIndividualGroup(group: Group) {
    return (
      group && !group.is_team && group.members && group.members.length === 2
    );
  }
}
