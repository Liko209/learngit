/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-14 14:06:42
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { PostItemData } from '../../entity/PostItemData';
import { ItemFile } from '../../../item/entity';

import { Post } from '../../entity/Post';
import { uniqueArray } from '../../../../utils';
import { PROGRESS_STATUS } from '../../../progress';
import notificationCenter from '../../../../service/notificationCenter';
import { SERVICE } from '../../../../service/eventKey';
import { IPostActionController } from '../interface/IPostActionController';
import {
  PostItemsReadyCallback,
  SendPostItemsUpdateCallback,
} from '../../types';
import { IPostItemController } from '../interface/IPostItemController';
import { ItemService } from '../../../item';
import { PostControllerUtils } from './PostControllerUtils';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { mainLogger } from 'foundation/log';
import { Nullable } from 'sdk/types';
import { daoManager } from 'sdk/dao';
import { PostDao } from '../../dao';
import PostAPI from 'sdk/api/glip/post';
import { transform } from 'sdk/service/utils';
import { Raw } from 'sdk/framework/model';
import { SequenceProcessorHandler, IProcessor } from 'sdk/framework/processor';
import { ProcessorInfo } from './types';

const LOG_TAG = 'PostItemController';
const SEQUENCE_NAME = 'GetPostsSequence';

class PostItemProcessor implements IProcessor {
  private _itemInfo: ProcessorInfo;
  private _processFunc: (info: ProcessorInfo) => Promise<Nullable<Post>>;
  private _resolve: (post: Nullable<Post>) => void;
  private _reject: (error: Error) => void;
  constructor(
    itemInfo: ProcessorInfo,
    processFunc: (info: ProcessorInfo) => Promise<Nullable<Post>>,
    resolve: (post: Nullable<Post>) => void,
    reject: (error: Error) => void,
  ) {
    this._itemInfo = itemInfo;
    this._processFunc = processFunc;
    this._resolve = resolve;
    this._reject = reject;
  }
  async process(): Promise<boolean> {
    try {
      const result = await this._processFunc(this._itemInfo);
      this._resolve(result);
    } catch (error) {
      this._reject(error);
    }
    return true;
  }
  name(): string {
    return this._itemInfo.itemId.toString();
  }
  cancel(): void {
    this._resolve(null);
  }
}
class PostItemController implements IPostItemController {
  private _sequenceProcessor: SequenceProcessorHandler;
  constructor(public postActionController: IPostActionController) {
    this._sequenceProcessor = new SequenceProcessorHandler({
      name: SEQUENCE_NAME,
      addProcessorStrategy: this._addProcessorStrategy,
    });
  }
  private _addProcessorStrategy = (
    totalProcessors: IProcessor[],
    newProcessor: IProcessor,
  ) => {
    if (totalProcessors.length) {
      totalProcessors.forEach((processor: IProcessor) => {
        if (processor && processor.cancel) {
          processor.cancel();
        }
      });
    }
    return [newProcessor];
  }

  /**
   * public APIs
   */
  async waiting4ItemsReady(
    post: Post,
    isResend: boolean,
    itemReadyCallback: PostItemsReadyCallback,
    postUpdateCallback: SendPostItemsUpdateCallback,
  ) {
    const pseudoItemIds = this.getPseudoItemIds(post);
    if (pseudoItemIds.length) {
      if (isResend) {
        this.resendFailedItems(pseudoItemIds);
        await this.waiting4Items(post, itemReadyCallback, postUpdateCallback);
        return;
      }
      if (!this.hasItemInTargetStatus(post, PROGRESS_STATUS.INPROGRESS)) {
        // return ;
        await itemReadyCallback({
          success: false,
          obj: {},
        });
      } else {
        await this.waiting4Items(post, itemReadyCallback, postUpdateCallback);
      }
    } else {
      await itemReadyCallback({
        success: true,
        obj: {},
      });
    }
  }

  async buildItemVersionMap(
    groupId: number,
    itemIds: number[],
  ): Promise<PostItemData | undefined> {
    if (itemIds && itemIds.length > 0) {
      const itemService = ServiceLoader.getInstance<ItemService>(
        ServiceConfig.ITEM_SERVICE,
      );
      const uploadFiles = itemService.getUploadItems(groupId);
      const needCheckItemFiles = _.intersectionWith(
        uploadFiles,
        itemIds,
        (itemFile: ItemFile, id: number) => id === itemFile.id,
      );
      if (needCheckItemFiles.length > 0) {
        const itemData: PostItemData = { version_map: {} };
        const promises = needCheckItemFiles.map(itemFile => itemService.getItemVersion(itemFile));
        const versions = await Promise.all(promises);
        for (let i = 0; i < needCheckItemFiles.length; i++) {
          if (versions[i]) {
            itemData.version_map[needCheckItemFiles[i].id] = versions[i];
          }
        }
        return itemData;
      }
    }
    return undefined;
  }

  /**
   * private APIs
   */

  async waiting4Items(
    post: Post,
    itemReadyCallback: PostItemsReadyCallback,
    postUpdateCallback: SendPostItemsUpdateCallback,
  ) {
    let isPostSent: boolean = false;
    const listener = async (params: {
      status: PROGRESS_STATUS;
      preInsertId: number;
      updatedId: number;
    }) => {
      const { preInsertId } = params;
      if (!post.item_ids.includes(preInsertId)) {
        return;
      }

      const result = this.updatePreInsertItemVersion.bind(this)(post, params);
      const clonePost = _.cloneDeep(result.post);
      const itemStatuses = this.getPseudoItemStatusInPost(clonePost);
      if (result.shouldUpdatePost) {
        await postUpdateCallback(clonePost);
        const itemService = ServiceLoader.getInstance<ItemService>(
          ServiceConfig.ITEM_SERVICE,
        );
        itemService.deleteFileItemCache(preInsertId);
      }

      if (PostControllerUtils.isValidPost(clonePost)) {
        if (!isPostSent && this.getPseudoItemIds(clonePost).length === 0) {
          isPostSent = true;
          // callback
          await itemReadyCallback({
            success: true,
            obj: { item_ids: clonePost.item_ids },
          });
        }
      } else {
        await itemReadyCallback({
          success: false,
          obj: { item_ids: clonePost.item_ids },
        });
      }

      // remove listener if item files are not in progress
      if (!itemStatuses.includes(PROGRESS_STATUS.INPROGRESS)) {
        // has failed
        if (itemStatuses.includes(PROGRESS_STATUS.FAIL)) {
          // callback
          await itemReadyCallback({
            success: false,
            obj: { item_ids: clonePost.item_ids },
          });
        }

        notificationCenter.removeListener(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          listener,
        );
      }
    };

    notificationCenter.on(SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS, listener);

    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    itemService.sendItemData(post.group_id, post.item_ids);
  }

  updatePreInsertItemVersion(
    post: Post,
    params: {
      status: PROGRESS_STATUS;
      preInsertId: number;
      updatedId: number;
    },
  ) {
    let shouldUpdatePost: boolean = true;
    const { status, preInsertId, updatedId } = params;
    mainLogger.tags(LOG_TAG).log('updatePreInsertItemVersion', params);
    if (status === PROGRESS_STATUS.CANCELED) {
      _.remove(post.item_ids, (id: number) => id === preInsertId);
    } else if (status === PROGRESS_STATUS.SUCCESS) {
      if (updatedId !== preInsertId) {
        const hasPreInsert = post.item_ids.includes(preInsertId);
        if (hasPreInsert) {
          post.item_ids = post.item_ids.filter(x => x !== preInsertId);
          post.item_ids.push(updatedId);
        }

        if (post.item_data && post.item_data.version_map) {
          const versionMap = post.item_data.version_map;
          Object.keys(versionMap).forEach((strKey: string) => {
            if (strKey === preInsertId.toString()) {
              versionMap[updatedId] = versionMap[preInsertId];
              delete versionMap[preInsertId];
            }
          });
        }
      }
    } else {
      shouldUpdatePost = false;
    }
    return {
      post,
      shouldUpdatePost,
    };
  }

  async resendFailedItems(pseudoItemIds: number[]) {
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    await itemService.resendFailedItems(pseudoItemIds);
  }

  getPseudoItemIds(post: Post) {
    return post.item_ids.filter(x => x < 0);
  }

  getPseudoItemStatusInPost(post: Post) {
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    return uniqueArray(itemService.getItemsSendingStatus(post.item_ids));
  }
  hasItemInTargetStatus(post: Post, status: PROGRESS_STATUS) {
    return this.getPseudoItemStatusInPost(post).indexOf(status) > -1;
  }
  private async _getPostsFromRemote(ids: number[]) {
    if (ids.length) {
      const remoteData = await PostAPI.requestByIds(ids);
      return remoteData.posts.map((item: Raw<Post>) => transform<Post>(item));
    }
    return [];
  }
  private _getLatestPost(groupId: number, posts: Post[]) {
    if (posts.length) {
      const postsInCurrentGroup = posts.filter(
        (post: Post) => post.group_id === groupId && !post.deactivated,
      );
      if (postsInCurrentGroup.length) {
        postsInCurrentGroup.sort((a, b) => b.created_at - a.created_at);
        return postsInCurrentGroup[0];
      }
    }
    return null;
  }

  async getLatestPostIdByItem(
    groupId: number,
    itemId: number,
  ): Promise<Nullable<Post>> {
    return new Promise<Nullable<Post>>((resolve, reject) => {
      const itemInfo = { groupId, itemId };
      const processor = new PostItemProcessor(
        itemInfo,
        this._getLatestPostIdByItem,
        resolve,
        reject,
      );
      this._sequenceProcessor.addProcessor(processor);
    });
  }
  private _getLatestPostIdByItem = async ({
    groupId,
    itemId,
  }: ProcessorInfo): Promise<Nullable<Post>> => {
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    const item = await itemService.getById(itemId);
    if (item) {
      const ids = item.post_ids;
      const localPosts = await daoManager.getDao(PostDao).batchGet(ids);
      const localPost = this._getLatestPost(groupId, localPosts);
      if (localPost) {
        return localPost;
      }
      const restIds = _.difference(ids, localPosts.map(({ id }) => id));
      if (restIds.length) {
        const remotePosts = await this._getPostsFromRemote(restIds);
        return this._getLatestPost(groupId, remotePosts);
      }
    }
    return null;
  }
}

export { PostItemController };
