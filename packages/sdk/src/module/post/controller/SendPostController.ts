/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-14 08:54:37
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { mainLogger } from 'foundation';
import { daoManager, PostDao, AccountDao } from '../../../dao';
import { Post } from '../entity';
import { SendPostType } from '../types';
import {
  ACCOUNT_USER_ID,
  ACCOUNT_COMPANY_ID,
} from '../../../dao/account/constants';
import PostActionControllerHelper from './PostActionControllerHelper';
import { ItemService } from '../../item/service';

import { ProgressService, PROGRESS_STATUS } from '../../progress';
import { notificationCenter, GroupConfigService } from '../../../service';
import { ENTITY } from '../../../service/eventKey';
import { uniqueArray } from '../../../utils';
import { ErrorParserHolder } from '../../../error';
import { PostActionController } from './PostActionController';
import { PostItemController } from './PostItemController';

type PostData = {
  id: number;
  data: Post;
};

class SendPostController {
  private _helper: PostActionControllerHelper;
  private _postItemController: PostItemController;
  constructor(public postActionController: PostActionController) {
    this._helper = new PostActionControllerHelper();
    this._postItemController = new PostItemController(
      this.postActionController,
    );
  }

  async sendPost(params: SendPostType) {
    const userId: number = daoManager.getKVDao(AccountDao).get(ACCOUNT_USER_ID);
    const companyId: number = daoManager
      .getKVDao(AccountDao)
      .get(ACCOUNT_COMPANY_ID);
    const paramsInfo = {
      userId,
      companyId,
      ...params,
    };
    const rawInfo = this._helper.buildRawPostInfo(paramsInfo);
    this.innerSendPost(rawInfo, false);
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

    await this.handlePreInsertProcess(post); // waiting for PreinsertController

    const sendPostAfterItemsReady = (result: {
      success: boolean;
      obj: Object;
    }) => {
      Object.keys(result.obj).forEach((key: string) => {
        post[key] = _.cloneDeep(result.obj[key]);
      });
      if (this.isValidPost(post)) {
        if (result.success) {
          this.sendPostToServer(post);
        } else {
          // handle failed
          this.handleSendPostFail(post.id, post.group_id);
        }
      } else {
        // delete post
        this.postActionController.deletePost(post.id);
      }
    };

    await this._postItemController.waiting4ItemsReady(
      post,
      isResend,
      sendPostAfterItemsReady,
    );
  }

  async sendPostToServer(post: Post): Promise<PostData[]> {
    const preInsertId = post.id;
    delete post.id;
    try {
      const result = await this.postActionController.requestController.post(
        post,
      );
      return this.handleSendPostSuccess(result, preInsertId);
    } catch (e) {
      this.handleSendPostFail(preInsertId, post.group_id);
      throw ErrorParserHolder.getErrorParser().parse(e);
    }
  }

  async handleSendPostSuccess(
    post: Post,
    preInsertId: number,
  ): Promise<PostData[]> {
    /**
     * 1. remove progress
     * 2. emit replace notification
     * 3. update failure Ids
     * 4. delete pre inserted post
     * 5. put in real post
     */
    const progressService: ProgressService = ProgressService.getInstance();
    progressService.deleteProgress(preInsertId);

    const obj: PostData = {
      id: preInsertId,
      data: post,
    };
    const result = [obj];
    const replacePosts = new Map<number, Post>();
    replacePosts.set(preInsertId, post);

    notificationCenter.emitEntityReplace(ENTITY.POST, replacePosts);
    const dao = daoManager.getDao(PostDao);

    const groupConfigService: GroupConfigService = GroupConfigService.getInstance();
    await groupConfigService.deletePostId(post.group_id, preInsertId);

    await dao.delete(preInsertId);
    await dao.put(post);
    return result;
  }

  async handleSendPostFail(preInsertId: number, groupId: number) {
    const progressService: ProgressService = ProgressService.getInstance();
    progressService.updateProgress(preInsertId, {
      id: preInsertId,
      status: PROGRESS_STATUS.FAIL,
    });

    const groupConfigService: GroupConfigService = GroupConfigService.getInstance();
    await groupConfigService.addPostId(groupId, preInsertId);
    return [];
  }

  private async _cleanUploadingFiles(groupId: number, itemIds: number[]) {
    const itemService: ItemService = ItemService.getInstance();
    itemService.cleanUploadingFiles(groupId, itemIds);
  }

  async handlePreInsertProcess(buildPost: Post): Promise<void> {
    const progressService: ProgressService = ProgressService.getInstance();
    progressService.addProgress(buildPost.id, {
      id: buildPost.id,
      status: PROGRESS_STATUS.INPROGRESS,
    });
    const dao = daoManager.getDao(PostDao);
    await dao.put(buildPost);
    notificationCenter.emitEntityUpdate(ENTITY.POST, [buildPost]);
  }

  getPseudoItemStatusInPost(post: Post) {
    const itemService: ItemService = ItemService.getInstance();
    return uniqueArray(itemService.getItemsSendingStatus(post.item_ids));
  }

  isValidPost(post: Post) {
    return post && (post.text.length > 0 || post.item_ids.length > 0);
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
}

export { SendPostController };
