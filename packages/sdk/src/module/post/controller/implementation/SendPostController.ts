/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-14 08:54:37
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { mainLogger, DEFAULT_RETRY_COUNT, REQUEST_PRIORITY } from 'foundation';
import { daoManager } from '../../../../dao';
import { PostDao } from '../../dao';
import { Post } from '../../entity';
import {
  SendPostType,
  PostItemsReadyCallbackType,
  EditPostType,
} from '../../types';
import SendPostControllerHelper from './SendPostControllerHelper';
import { ItemService } from '../../../item/service';

import notificationCenter from '../../../../service/notificationCenter';
import { GroupConfigService } from '../../../groupConfig';
import { ENTITY } from '../../../../service/eventKey';
import { ErrorParserHolder } from '../../../../error';
import { PostActionController } from './PostActionController';
import { PostItemController } from './PostItemController';
import { IPostItemController } from '../interface/IPostItemController';
import { ISendPostController } from '../interface/ISendPostController';
import { IPreInsertController } from '../../../common/controller/interface/IPreInsertController';
import { Raw } from '../../../../framework/model';
import { AccountService } from '../../../account/service';
import { PostControllerUtils } from './PostControllerUtils';
import { PROGRESS_STATUS } from '../../../progress';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { PostDataController } from '../PostDataController';

class SendPostController implements ISendPostController {
  private _helper: SendPostControllerHelper;
  private _postItemController: IPostItemController;
  constructor(
    public postActionController: PostActionController,
    public preInsertController: IPreInsertController,
    public postDataController: PostDataController,
  ) {
    this._helper = new SendPostControllerHelper();
    this._postItemController = new PostItemController(
      this.postActionController,
    );
  }

  async sendPost(params: SendPostType) {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const userId: number = userConfig.getGlipUserId();
    const companyId: number = userConfig.getCurrentCompanyId();
    const paramsInfo = {
      userId,
      companyId,
      ...params,
    };
    const rawInfo = this._helper.buildRawPostInfo(
      paramsInfo,
      this.preInsertController.getAll(),
    );
    await this.innerSendPost(rawInfo, false);
  }

  async reSendPost(id: number) {
    if (id < 0) {
      const dao = daoManager.getDao(PostDao);
      const post = await dao.get(id);
      if (post) {
        return this.innerSendPost(post, true);
      }
    }
    mainLogger.warn(
      `PostActionController: invalid, should not resend, id ${id}`,
    );
    return null;
  }

  async editFailedPost(params: EditPostType) {
    this.postActionController.editFailedPost(params, this.innerSendPost);
  }

  /**
   * 1. clean uploading files
   * 2. pre insert post
   */
  innerSendPost = async (post: Post, isResend: boolean) => {
    const hasItems = post.item_ids.length > 0;
    if (!isResend && hasItems) {
      const itemData = await this._postItemController.buildItemVersionMap(
        post.group_id,
        post.item_ids,
      );
      /* eslint-disable no-unneeded-ternary */
      post.item_data = itemData ? itemData : post.item_data;
      this._cleanUploadingFiles(post.group_id, post.item_ids);
    }

    await this.preInsertController.insert(post);

    const sendPostAfterItemsReady = async (
      result: PostItemsReadyCallbackType,
    ) => {
      Object.keys(result.obj).forEach((key: string) => {
        post[key] = _.cloneDeep(result.obj[key]);
      });
      if (PostControllerUtils.isValidPost(post)) {
        if (result.success) {
          await this.sendPostToServer(post);
        } else {
          // handle failed
          await this.handleSendPostFail(post, post.group_id);
        }
      } else {
        // delete post
        await this.postActionController.deletePost(post.id);
      }
    };

    const updateLocalPostCallback = async (
      post: Partial<Post>,
    ): Promise<Post | null> => await this.updateLocalPost(post);

    await this._postItemController.waiting4ItemsReady(
      post,
      isResend,
      sendPostAfterItemsReady,
      updateLocalPostCallback,
    );
    return post;
  };

  async updateLocalPost(post: Partial<Post>) {
    const backup = _.cloneDeep(post);
    const preHandlePartial = (
      partialPost: Partial<Raw<Post>>,
    ): Partial<Raw<Post>> => ({
      ...partialPost,
      ...backup,
    });
    if (backup.id) {
      return this.postActionController.partialModifyController.updatePartially(
        backup.id,
        preHandlePartial,
        async (newPost: Post) => newPost,
        (
          originalEntities: Post[],
          updatedEntities: Post[],
          partialEntities: Partial<Raw<Post>>[],
        ) => {
          notificationCenter.emitEntityUpdate(
            `${ENTITY.POST}.${post.group_id}`,
            updatedEntities,
            partialEntities,
          );
        },
      );
    }
    throw new Error('updateLocalPost error invalid id');
  }

  async sendPostToServer(post: Post): Promise<Post> {
    const sendPost = _.cloneDeep(post);
    delete sendPost.id;
    try {
      const result = await this.postActionController.requestController.post(
        sendPost,
        {
          priority: REQUEST_PRIORITY.HIGH,
          retryCount: DEFAULT_RETRY_COUNT,
        },
      );
      return await this.handleSendPostSuccess(result, post);
    } catch (e) {
      this.handleSendPostFail(post, post.group_id);
      throw ErrorParserHolder.getErrorParser().parse(e);
    }
  }

  async handleSendPostSuccess(post: Post, originalPost: Post): Promise<Post> {
    const replacePosts = new Map<number, Post>();
    replacePosts.set(originalPost.id, post);

    notificationCenter.emitEntityReplace(
      `${ENTITY.POST}.${post.group_id}`,
      replacePosts,
    );
    const dao = daoManager.getDao(PostDao);

    await this.postDataController.deletePreInsertPosts([originalPost]);
    await dao.put(post);

    return post;
  }

  async handleSendPostFail(originalPost: Post, groupId: number) {
    this.preInsertController.updateStatus(originalPost, PROGRESS_STATUS.FAIL);
    const groupConfigService = ServiceLoader.getInstance<GroupConfigService>(
      ServiceConfig.GROUP_CONFIG_SERVICE,
    );
    await groupConfigService.addPostId(groupId, originalPost.id);
    return [];
  }

  private async _cleanUploadingFiles(groupId: number, itemIds: number[]) {
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    itemService.cleanUploadingFiles(groupId, itemIds);
  }
}

export { SendPostController };
