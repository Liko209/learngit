/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 13:39:10
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupState, State } from '../../entity/State';
import { GroupService } from '../../../group';
import { IRequestController } from '../../../../framework/controller/interface/IRequestController';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { StateFetchDataController } from './StateFetchDataController';
import { TotalUnreadController } from './TotalUnreadController';
import { Raw } from '../../../../framework/model';
import { mainLogger } from 'foundation';
import { PartialModifyController } from '../../../../framework/controller/impl/PartialModifyController';

class StateActionController {
  private _partialModifyController: IPartialModifyController<GroupState>;
  constructor(
    private _entitySourceController: IEntitySourceController<GroupState>,
    private _requestController: IRequestController<State>,
    private _stateFetchDataController: StateFetchDataController,
    private _totalUnreadController: TotalUnreadController,
  ) {
    this._partialModifyController = new PartialModifyController<GroupState>(
      this._entitySourceController,
    );
  }

  async updateReadStatus(
    groupId: number,
    isUnread: boolean,
    ignoreError: boolean,
  ): Promise<void> {
    const groupService: GroupService = GroupService.getInstance();
    let group;
    try {
      group = await groupService.getById(groupId);
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

    const lastPostId = group.most_recent_post_id;
    const myStateId = this._stateFetchDataController.getMyStateId();
    if (lastPostId && myStateId > 0) {
      await this._partialModifyController.updatePartially(
        groupId,
        (partialEntity: Partial<Raw<GroupState>>) => {
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
            last_read_through: lastPostId,
            unread_count: 0,
            unread_mentions_count: 0,
            unread_deactivated_count: 0,
            marked_as_unread: false,
          };
        },
        async (updatedEntity: GroupState) => {
          this._totalUnreadController.handleGroupState([updatedEntity]);
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
      );
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
      ['id']: myStateId,
      [`unread_count:${groupState.id}`]: groupState.unread_count,
      [`unread_mentions_count:${
        groupState.id
      }`]: groupState.unread_mentions_count,
      [`unread_deactivated_count:${
        groupState.id
      }`]: groupState.unread_deactivated_count,
      [`read_through:${groupState.id}`]: groupState.read_through,
      [`marked_as_unread:${groupState.id}`]: groupState.marked_as_unread,
    };
  }

  private _buildUpdateUnreadStatusParams(
    myStateId: number,
    groupState: GroupState,
  ): Partial<State> {
    return {
      ['id']: myStateId,
      [`unread_count:${groupState.id}`]: groupState.unread_count,
      [`post_cursor:${groupState.id}`]: groupState.post_cursor,
      [`marked_as_unread:${groupState.id}`]: groupState.marked_as_unread,
    };
  }
}

export { StateActionController };
