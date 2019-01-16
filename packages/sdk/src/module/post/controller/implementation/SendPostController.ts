/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-14 08:54:37
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { mainLogger } from 'foundation';
import { daoManager, PostDao, AccountDao } from '../../../../dao';
import { Post } from '../../entity';
import { SendPostType, PostItemsReadyCallbackType } from '../../types';
import {
  ACCOUNT_USER_ID,
  ACCOUNT_COMPANY_ID,
} from '../../../../dao/account/constants';
import SendPostControllerHelper from './SendPostControllerHelper';
import { ItemService } from '../../../item/service';

import { notificationCenter, GroupConfigService } from '../../../../service';
import { ENTITY } from '../../../../service/eventKey';
import { ErrorParserHolder } from '../../../../error';
import { PostActionController } from './PostActionController';
import { PostItemController } from './PostItemController';
import { IPostItemController } from '../interface/IPostItemController';
import { ISendPostController } from '../interface/ISendPostController';
import { IPreInsertController } from '../../../../framework/controller/interface/IPreInsertController';

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

    await this.preInsertController.preInsert(post);

    const sendPostAfterItemsReady = (result: PostItemsReadyCallbackType) => {
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

    // 1. change status
    // 2. delete from db
    await this.preInsertController.incomesStatusChange(preInsertId, true);

    await dao.put(post);
    return result;
  }

  async handleSendPostFail(preInsertId: number, groupId: number) {
    this.preInsertController.incomesStatusChange(preInsertId, false);
    const groupConfigService: GroupConfigService = GroupConfigService.getInstance();
    await groupConfigService.addPostId(groupId, preInsertId);
    return [];
  }

  private async _cleanUploadingFiles(groupId: number, itemIds: number[]) {
    const itemService: ItemService = ItemService.getInstance();
    itemService.cleanUploadingFiles(groupId, itemIds);
  }

  isValidPost(post: Post) {
    return post && (post.text.length > 0 || post.item_ids.length > 0);
  }
}

export { SendPostController };
