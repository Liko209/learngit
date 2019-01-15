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
import { notificationCenter } from '../../../../service';
import { SERVICE } from '../../../../service/eventKey';
import { IPostActionController } from '../interface/IPostActionController';
import { PostItemsReadyCallback } from '../../types';
import { IPostItemController } from '../interface/IPostItemController';
import { ItemService } from '../../../item';

class PostItemController implements IPostItemController {
  constructor(public postActionController: IPostActionController) {}

  /**
   * public APIs
   */
  async waiting4ItemsReady(
    post: Post,
    isResend: boolean,
    callback: PostItemsReadyCallback,
  ) {
    const pseudoItemIds = this.getPseudoItemIds(post);
    if (pseudoItemIds.length) {
      if (isResend) {
        this.resendFailedItems(pseudoItemIds);
        await this.waiting4Items(post, callback);
      } else if (
        !this.hasItemInTargetStatus(post, PROGRESS_STATUS.INPROGRESS)
      ) {
        // return ;
        callback({
          success: false,
          obj: {},
        });
      } else {
        await this.waiting4Items(post, callback);
      }
    } else {
      callback({
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
      const itemService: ItemService = ItemService.getInstance();
      const uploadFiles = itemService.getUploadItems(groupId);
      const needCheckItemFiles = _.intersectionWith(
        uploadFiles,
        itemIds,
        (itemFile: ItemFile, id: number) => {
          return id === itemFile.id && !itemFile.is_new;
        },
      );
      if (needCheckItemFiles.length > 0) {
        const itemData: PostItemData = { version_map: {} };
        const promises = needCheckItemFiles.map(itemFile =>
          itemService.getItemVersion(itemFile),
        );
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

  async waiting4Items(post: Post, callback: PostItemsReadyCallback) {
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
        await this.updatePreInsertedItemIdsInPost.bind(this)(clonePost);
        const itemService: ItemService = ItemService.getInstance();
        itemService.deleteFileItemCache(preInsertId);
      }

      if (this.isValidPost(clonePost)) {
        if (!isPostSent && this.getPseudoItemIds(clonePost).length === 0) {
          isPostSent = true;
          // callback
          callback({ success: true, obj: { item_ids: clonePost.item_ids } });
        }
      } else {
        callback({ success: false, obj: { item_ids: clonePost.item_ids } });
      }

      // remove listener if item files are not in progress
      if (!itemStatuses.includes(PROGRESS_STATUS.INPROGRESS)) {
        // has failed
        if (itemStatuses.includes(PROGRESS_STATUS.FAIL)) {
          // callback
          callback({ success: false, obj: { item_ids: clonePost.item_ids } });
        }

        notificationCenter.removeListener(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          listener,
        );
      }
    };

    notificationCenter.on(SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS, listener);

    const itemService: ItemService = ItemService.getInstance();
    itemService.sendItemData(post.group_id, post.item_ids);
  }

  async updatePreInsertedItemIdsInPost(clonePost: Post) {
    await this.postActionController.updateLocalPost(clonePost);
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
    if (status === PROGRESS_STATUS.CANCELED) {
      _.remove(post.item_ids, (id: number) => {
        return id === preInsertId;
      });
    } else if (status === PROGRESS_STATUS.SUCCESS) {
      if (updatedId !== preInsertId) {
        post.item_ids = post.item_ids.map((id: number) => {
          return id === preInsertId ? updatedId : id;
        });

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
    const itemService: ItemService = ItemService.getInstance();
    await itemService.resendFailedItems(pseudoItemIds);
  }

  getPseudoItemIds(post: Post) {
    return post.item_ids.filter(x => x < 0);
  }

  getPseudoItemStatusInPost(post: Post) {
    const itemService: ItemService = ItemService.getInstance();
    return uniqueArray(itemService.getItemsSendingStatus(post.item_ids));
  }
  hasItemInTargetStatus(post: Post, status: PROGRESS_STATUS) {
    return this.getPseudoItemStatusInPost(post).indexOf(status) > -1;
  }

  isValidPost(post: Post) {
    return post && (post.text.length > 0 || post.item_ids.length > 0);
  }
}

export { PostItemController };
