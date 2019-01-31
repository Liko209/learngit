/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 13:39:10
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupState, State } from '../../entity/State';
import { Post } from '../../../post/entity';
import { IRequestController } from '../../../../framework/controller/interface/IRequestController';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { StateFetchDataController } from './StateFetchDataController';
import { Raw } from '../../../../framework/model';
import { NewPostService } from '../../../post';

class StateActionController {
  constructor(
    private _partialModifyController: IPartialModifyController<GroupState>,
    private _requestController: IRequestController<State>,
    private _stateFetchDataController: StateFetchDataController,
  ) {}

  async updateReadStatus(groupId: number, isUnread: boolean): Promise<void> {
    const lastPost = await this._getLastPostOfGroup(groupId);
    let lastPostId = lastPost && lastPost.id;
    if (!lastPostId) {
      const postService = NewPostService.getInstance<NewPostService>();
      lastPostId = await postService.getNewestPostIdOfGroup(groupId);
    }
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
            read_through: lastPostId || undefined,
            last_read_through: lastPostId || undefined,
            unread_count: 0,
            unread_mentions_count: 0,
            unread_deactivated_count: 0,
            marked_as_unread: false,
          };
        },
        async (updatedEntity: GroupState) => {
          return await this._requestController.put(
            this._buildUpdateReadStatusParams(myStateId, updatedEntity),
          );
        },
      );
    }
  }

  async updateLastGroup(groupId: number): Promise<void> {
    const myStateId = this._stateFetchDataController.getMyStateId();
    if (myStateId > 0) {
      await this._requestController.put({
        id: myStateId,
        last_group_id: groupId,
      });
    }
  }

  private async _getLastPostOfGroup(groupId: number): Promise<Post | null> {
    const postService: NewPostService = NewPostService.getInstance();
    return await postService.getLastPostOfGroup(groupId);
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
