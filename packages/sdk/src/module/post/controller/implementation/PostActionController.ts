/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 13:54:00
 * Copyright © RingCentral. All rights reserved.
 */
import { Post } from '../../entity';
import { Raw } from '../../../../framework/model';
import _ from 'lodash';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { IRequestController } from '../../../../framework/controller/interface/IRequestController';
import { daoManager } from '../../../../dao';
import { PostDao } from '../../dao';
import { EditPostType } from '../../types';
import notificationCenter from '../../../../service/notificationCenter';
import { ENTITY } from '../../../../service/eventKey';
import { IPostActionController } from '../interface/IPostActionController';
import { ItemService } from '../../../item/service';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { PostControllerUtils } from './PostControllerUtils';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { mainLogger } from 'foundation/log';
import { DEFAULT_RETRY_COUNT } from 'foundation/network';
import { PostDataController } from '../PostDataController';

class PostActionController implements IPostActionController {
  private TAG = 'PostActionController';
  constructor(
    public postDataController: PostDataController,
    public partialModifyController: IPartialModifyController<Post>,
    public requestController: IRequestController<Post>,
    public entitySourceController: IEntitySourceController<Post>,
  ) {}

  async likePost(
    postId: number,
    personId: number,
    toLike: boolean,
  ): Promise<Post | null> {
    const preHandlePartial = (
      partialPost: Partial<Raw<Post>>,
      originalPost: Post,
    ): Partial<Raw<Post>> => {
      const likes = _.cloneDeep(originalPost.likes) || [];
      const index = likes.indexOf(personId);
      if (toLike) {
        if (index === -1) {
          likes.push(personId);
        }
      } else if (index > -1) {
        likes.splice(index, 1);
      }
      return {
        ...partialPost,
        likes,
      };
    };
    return this.partialModifyController.updatePartially({
      entityId: postId,
      preHandlePartialEntity: preHandlePartial,
      doUpdateEntity: async (newPost: Post) =>
        this.requestController.put(newPost),
      doPartialNotify: this._doPartialNotify.bind(this),
    });
  }

  private _doPartialNotify(
    originalEntities: Post[],
    updatedEntities: Post[],
    partialEntities: Partial<Raw<Post>>[],
  ) {
    const groupId = originalEntities[0].group_id;
    notificationCenter.emitEntityUpdate(
      `${ENTITY.POST}.${groupId}`,
      updatedEntities,
      partialEntities,
    );
  }

  /**
   * edit post does not need to do pre-insert
   */
  private _editPost(
    params: EditPostType,
    doUpdateEntity: (newPost: Post) => Promise<any>,
    forceDoUpdateEntity?: boolean,
    shouldRollback?: boolean,
  ) {
    const preHandlePartial = (
      partialPost: Partial<Raw<Post>>,
    ): Partial<Raw<Post>> => ({
      text: params.text,
      at_mention_non_item_ids: params.mentionNonItemIds || [],
      is_team_mention: params.isTeamMention,
      ...partialPost,
    });

    return this.partialModifyController.updatePartially({
      forceDoUpdateEntity,
      shouldRollback,
      doUpdateEntity,
      entityId: params.postId,
      preHandlePartialEntity: preHandlePartial,
      doPartialNotify: this._doPartialNotify.bind(this),
    });
  }

  async editSuccessPost(params: EditPostType) {
    return this._editPost(params, async (newPost: Post) =>
      this.requestController.put(newPost, {
        retryCount: DEFAULT_RETRY_COUNT,
      }),
    );
  }

  editFailedPost(
    params: EditPostType,
    reSendFunc: (post: Post, isResend: boolean) => Promise<Post>,
  ) {
    return this._editPost(
      params,
      (newPost: Post) => reSendFunc(newPost, true),
      true,
      false,
    );
  }

  /**
   * deletePost begin
   */
  private async _deletePreInsertedPost(id: number): Promise<boolean> {
    const postDao = daoManager.getDao(PostDao);
    const post = (await postDao.get(id)) as Post;
    this.postDataController.deletePreInsertPosts([post]);
    return true;
  }

  async deletePost(id: number): Promise<boolean> {
    if (id < 0) {
      return this._deletePreInsertedPost(id);
    }
    return !!(await this._deletePostFromRemote(id));
  }

  async removeItemFromPost(postId: number, itemId: number) {
    const post = await this.entitySourceController.getEntityLocally(postId);
    if (post) {
      const itemIds = post.item_ids.filter((value: number) => value !== itemId);
      post.item_ids = itemIds;
      const isValid = PostControllerUtils.isValidPost(post);
      const preHandlePartial = (
        partialPost: Partial<Raw<Post>>,
      ): Partial<Raw<Post>> => ({
        item_ids: itemIds,
        deactivated: !isValid,
        ...partialPost,
      });
      await this.partialModifyController.updatePartially({
        entityId: postId,
        preHandlePartialEntity: preHandlePartial,
        doUpdateEntity: async (newPost: Post) => {
          if (newPost.id > 0) {
            return await this.requestController.put(newPost);
          }

          if (!isValid) {
            await this.deletePost(postId);
          }

          return newPost;
        },
        doPartialNotify: this._doPartialNotify.bind(this),
      });
    }

    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    await itemService.deleteItem(itemId);
  }

  async deletePostsByGroupIds(groupIds: number[], shouldNotify: boolean) {
    const dao = daoManager.getDao(PostDao);
    const promises = groupIds.map(id => dao.queryPostIdsByGroupId(id));
    const postsMap = await Promise.all(promises);
    const postIds = _.union(...postsMap);
    mainLogger.tags(this.TAG).info(`deletePostsByGroupIds:${postIds}`);
    await dao.bulkDelete(postIds);
    if (shouldNotify) {
      notificationCenter.emitEntityDelete(ENTITY.POST, postIds);
    }
  }

  private async _deletePostFromRemote(id: number) {
    const preHandlePartial = (
      partialPost: Partial<Raw<Post>>,
    ): Partial<Raw<Post>> => ({
      deactivated: true,
      ...partialPost,
    });

    return this.partialModifyController.updatePartially({
      entityId: id,
      preHandlePartialEntity: preHandlePartial,
      doUpdateEntity: async (newPost: Post) =>
        this.requestController.put(newPost),
      doPartialNotify: this._doPartialNotify.bind(this),
    });
  }
}

export { PostActionController };
