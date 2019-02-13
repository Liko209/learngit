/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 13:39:10
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupState, State } from '../../entity/State';
import { GroupService } from '../../../group';
import { IRequestController } from '../../../../framework/controller/interface/IRequestController';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { StateFetchDataController } from './StateFetchDataController';
import { TotalUnreadController } from './TotalUnreadController';
import { Raw } from '../../../../framework/model';
import { NewPostService } from '../../../post';
import { mainLogger } from 'foundation';

class StateActionController {
  constructor(
    private _partialModifyController: IPartialModifyController<GroupState>,
    private _requestController: IRequestController<State>,
    private _stateFetchDataController: StateFetchDataController,
    private _totalUnreadController: TotalUnreadController,
  ) {}

  async updateReadStatus(groupId: number, isUnread: boolean): Promise<void> {
    const groupService: GroupService = GroupService.getInstance();
    const group = await groupService.getById(groupId);
    if (!group) {
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
            return await this._requestController.put(
              this._buildUpdateReadStatusParams(myStateId, updatedEntity),
            );
          } catch (e) {
            mainLogger.error('updateReadStatus: send request failed');
            return updatedEntity;
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
}

export { StateActionController };
