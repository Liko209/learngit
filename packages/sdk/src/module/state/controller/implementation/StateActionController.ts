/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 13:39:10
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupState, State } from '../../entity/State';
import { IGroupService } from '../../../group/service/IGroupService';
import { IRequestController } from '../../../../framework/controller/interface/IRequestController';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { StateFetchDataController } from './StateFetchDataController';
import { Raw } from '../../../../framework/model';
import { mainLogger } from 'foundation/log';
import { PartialModifyController } from '../../../../framework/controller/impl/PartialModifyController';

class StateActionController {
  private _partialModifyController: IPartialModifyController<GroupState>;
  constructor(
    private _groupService: IGroupService,
    private _entitySourceController: IEntitySourceController<GroupState>,
    private _requestController: IRequestController<State>,
    private _stateFetchDataController: StateFetchDataController,
  ) {
    this._partialModifyController = new PartialModifyController<GroupState>(
      this._entitySourceController,
    );

    // todo fixme  just for test
    (window as any).generateTeamCursorDirtyData = async (
      teamId: number,
      count: number = -2,
    ) => {
      const state = await this._entitySourceController.get(teamId);
      mainLogger
        .tags('[FIX-TEAM-UMI]')
        .debug(
          `generateTeamCursorDirtyData team count: ${count}, state:`,
          state,
        );
      this._entitySourceController.update({
        ...state,
        marked_as_unread: true,
        unread_team_mentions_count: count,
      });
    };
  }

  async updateReadStatus(
    groupId: number,
    isUnread: boolean,
    ignoreError: boolean,
  ): Promise<void> {
    let group;
    try {
      group = await this._groupService.getById(groupId);
    } catch (error) {
      group = null;
    }
    if (!group) {
      return;
    }

    const groupState = await this._entitySourceController.get(groupId);
    if (!groupState || !groupState.group_post_cursor) {
      return;
    }

    const postCursor =
      (groupState.group_post_cursor ? groupState.group_post_cursor : 0) +
      (groupState.group_post_drp_cursor
        ? groupState.group_post_drp_cursor
        : 0) -
      1;

    if (postCursor < 0) {
      return;
    }

    const lastPostId = Math.max(
      group.most_recent_post_id || 0,
      groupState.read_through || 0,
    );
    const myStateId = this._stateFetchDataController.getMyStateId();
    if (myStateId > 0) {
      await this._partialModifyController.updatePartially({
        entityId: groupId,
        preHandlePartialEntity: (
          partialEntity: Partial<Raw<GroupState>>,
          originEntity,
        ) => {
          if (isUnread) {
            return {
              ...partialEntity,
              unread_count: 1,
              post_cursor: postCursor,
              marked_as_unread: true,
            };
          }
          return {
            ...partialEntity,
            read_through: lastPostId,
            team_mention_cursor: originEntity.group_team_mention_cursor,
            unread_count: 0,
            unread_mentions_count: 0,
            unread_deactivated_count: 0,
            marked_as_unread: false,
          };
        },
        doUpdateEntity: async (updatedEntity: GroupState) => {
          try {
            if (isUnread) {
              return await this._requestController.put(
                this._buildUpdateUnreadStatusParams(myStateId, updatedEntity),
              );
            }
            return await this._requestController.put(
              this._buildUpdateReadStatusParams(myStateId, updatedEntity),
            );
          } catch (e) {
            mainLogger.error('updateReadStatus: send request failed');
            if (ignoreError) {
              return updatedEntity;
            }
            throw e;
          }
        },
      });
    }
  }

  async updateLastGroup(groupId: number): Promise<void> {
    const myStateId = this._stateFetchDataController.getMyStateId();
    if (myStateId > 0) {
      try {
        await this._requestController.put({
          id: myStateId,
          last_group_id: groupId,
        });
      } catch (e) {
        mainLogger.error('updateLastGroup failed');
        return;
      }
    }
  }

  private _buildUpdateReadStatusParams(
    myStateId: number,
    groupState: GroupState,
  ): Partial<State> {
    return {
      id: myStateId,
      [`unread_count:${groupState.id}`]: groupState.unread_count,
      [`unread_mentions_count:${
        groupState.id
      }`]: groupState.unread_mentions_count,
      [`unread_deactivated_count:${
        groupState.id
      }`]: groupState.unread_deactivated_count,
      [`read_through:${groupState.id}`]: groupState.read_through,
      [`marked_as_unread:${groupState.id}`]: groupState.marked_as_unread,
      [`team_mention_cursor:${groupState.id}`]: groupState.team_mention_cursor,
    };
  }

  private _buildUpdateUnreadStatusParams(
    myStateId: number,
    groupState: GroupState,
  ): Partial<State> {
    return {
      id: myStateId,
      [`unread_count:${groupState.id}`]: groupState.unread_count,
      [`post_cursor:${groupState.id}`]: groupState.post_cursor,
      [`marked_as_unread:${groupState.id}`]: groupState.marked_as_unread,
    };
  }
}

export { StateActionController };
