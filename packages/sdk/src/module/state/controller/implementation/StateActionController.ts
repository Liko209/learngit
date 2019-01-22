/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 13:39:10
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupState, State } from '../../entity/State';
import { Post } from '../../../post/entity';
import { IRequestController } from '../../../../framework/controller/interface/IRequestController';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { daoManager, PostDao } from '../../../../dao';
import PostService from '../../../../service/post';
import { StateFetchDataController } from './StateFetchDataController';
import { mainLogger } from 'foundation';

class StateActionController {
  constructor(
    private _partialModifyController: IPartialModifyController<GroupState>,
    private _requestController: IRequestController<State>,
    private _entitySourceController: IEntitySourceController<GroupState>,
    private _stateFetchDataController: StateFetchDataController,
  ) {}

  async updateReadStatus(groupId: number, isUnread: boolean): Promise<void> {
    const groupState = await this._entitySourceController.get(groupId);
    if (!groupState || isUnread === groupState.marked_as_unread) {
      mainLogger.info(
        '[State Action Controller] Can not update read status, groupState: ',
        groupState,
      );
      return;
    }
    const lastPost = (await this._getLastPostOfGroup(groupId)) || undefined;
    let lastPostId = lastPost && lastPost.id;
    if (!lastPostId) {
      const postService = PostService.getInstance<PostService>();
      lastPostId =
        (await postService.getNewestPostIdOfGroup(groupId)) || undefined;
    }
    const myStateId = this._stateFetchDataController.getMyStateId();
    if (lastPostId && myStateId > 0) {
      await this._partialModifyController.updatePartially(
        groupId,
        (partialEntity, originalEntity) => {
          const newStateCursor = this._updateStateCursor(
            originalEntity.group_post_cursor,
            originalEntity.group_post_drp_cursor,
          );
          if (isUnread) {
            return {
              ...partialEntity,
              unread_count: 1,
              post_cursor: newStateCursor > 0 ? newStateCursor - 1 : 0,
            };
          }
          return {
            ...partialEntity,
            read_through: lastPostId,
            last_read_through: lastPostId,
            unread_count: 0,
            unread_mentions_count: 0,
            post_cursor: newStateCursor,
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
    return await daoManager.getDao(PostDao).queryLastPostByGroupId(groupId);
  }

  private _updateStateCursor(
    groupCursor?: number,
    groupDrpCursor?: number,
  ): number {
    return (
      (groupCursor && groupCursor >= 0 ? groupCursor : 0) +
      (groupDrpCursor && groupDrpCursor >= 0 ? groupDrpCursor : 0)
    );
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
      [`post_cursor:${groupState.id}`]: groupState.post_cursor,
    };
  }
}

export { StateActionController };
