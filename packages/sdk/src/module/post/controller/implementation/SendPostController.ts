/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-14 08:54:37
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { mainLogger, DEFAULT_RETRY_COUNT } from 'foundation';
import { daoManager } from '../../../../dao';
import { PostDao } from '../../dao';
import { Post } from '../../entity';
import { SendPostType, PostItemsReadyCallbackType } from '../../types';
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

type PostData = {
  id: number;
  data: Post;
};

class SendPostController implements ISendPostController {
  private _helper: SendPostControllerHelper;
  private _postItemController: IPostItemController;
  constructor(
    public postActionController: PostActionController,
    public preInsertController: IPreInsertController,
  ) {
    this._helper = new SendPostControllerHelper();
    this._postItemController = new PostItemController(
      this.postActionController,
    );
  }

  private async _recordMyLastPost(groupId: number, postTime: number) {
    const groupConfigService = ServiceLoader.getInstance<GroupConfigService>(
      ServiceConfig.GROUP_CONFIG_SERVICE,
    );
    await groupConfigService.recordMyLastPostTime(groupId, postTime);
  }

  async sendPost(params: SendPostType) {
    this._recordMyLastPost(params.groupId, Date.now());
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
    const rawInfo = this._helper.buildRawPostInfo(paramsInfo);
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

  /**
   * 1. clean uploading files
   * 2. pre insert post
   */
  async innerSendPost(post: Post, isResend: boolean) {
    const hasItems = post.item_ids.length > 0;
    if (!isResend && hasItems) {
      const itemData = await this._postItemController.buildItemVersionMap(
        post.group_id,
        post.item_ids,
      );
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
    ): Promise<Post | null> => {
      return await this.updateLocalPost(post);
    };

    await this._postItemController.waiting4ItemsReady(
      post,
      isResend,
      sendPostAfterItemsReady,
      updateLocalPostCallback,
    );
  }

  async updateLocalPost(post: Partial<Post>) {
    const backup = _.cloneDeep(post);
    const preHandlePartial = (
      partialPost: Partial<Raw<Post>>,
      originalPost: Post,
    ): Partial<Raw<Post>> => {
      return {
        ...partialPost,
        ...backup,
      };
    };
    if (backup.id) {
      return this.postActionController.partialModifyController.updatePartially(
        backup.id,
        preHandlePartial,
        async (newPost: Post) => {
          return newPost;
        },
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

  async sendPostToServer(post: Post): Promise<PostData[]> {
    const sendPost = _.cloneDeep(post);
    delete sendPost.id;
    try {
      const result = await this.postActionController.requestController.post(
        sendPost,
        {
          retryCount: DEFAULT_RETRY_COUNT,
        },
      );
      return await this.handleSendPostSuccess(result, post);
    } catch (e) {
      this.handleSendPostFail(post, post.group_id);
      throw ErrorParserHolder.getErrorParser().parse(e);
    }
  }

  async handleSendPostSuccess(
    post: Post,
    originalPost: Post,
  ): Promise<PostData[]> {
    const obj: PostData = {
      id: originalPost.id,
      data: post,
    };
    const result = [obj];
    const replacePosts = new Map<number, Post>();
    replacePosts.set(originalPost.id, post);

    notificationCenter.emitEntityReplace(
      `${ENTITY.POST}.${post.group_id}`,
      replacePosts,
    );
    const dao = daoManager.getDao(PostDao);

    const groupConfigService = ServiceLoader.getInstance<GroupConfigService>(
      ServiceConfig.GROUP_CONFIG_SERVICE,
    );
    await groupConfigService.deletePostId(post.group_id, originalPost.id);

    // 1. change status
    // 2. delete from db
    await this.preInsertController.delete(originalPost);
    await dao.put(post);
    return result;
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
