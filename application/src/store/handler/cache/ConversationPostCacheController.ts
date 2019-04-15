/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2019-02-04 10:02:00
 * Copyright © RingCentral. All rights reserved.
 */

import {
  FetchSortableDataListHandler,
  ISortableModel,
  TDelta,
  DeltaDataHandler,
} from '@/store/base';
import { Post } from 'sdk/module/post/entity';
import storeManager, { ENTITY_NAME } from '@/store';
import GlipTypeUtil from 'sdk/utils/glip-type-dictionary/util';
import { TypeDictionary } from 'sdk/utils';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import PostModel from '@/store/models/Post';
import _ from 'lodash';
import { ThumbnailPreloadController } from './ThumbnailPreloadController';
import { PostCacheController } from './PostCacheController';
import { ConversationPostFocBuilder } from './ConversationPostFocBuilder';
import { QUERY_DIRECTION } from 'sdk/dao';

class ConversationPostCacheController extends PostCacheController {
  private _cacheDeltaDataHandlerMap: Map<number, DeltaDataHandler> = new Map();
  private _thumbnailPreloadController: ThumbnailPreloadController;

  name() {
    return 'ConversationPostCacheController';
  }

  private _getThumbnailPreloadController() {
    if (!this._thumbnailPreloadController) {
      this._thumbnailPreloadController = new ThumbnailPreloadController();
    }
    return this._thumbnailPreloadController;
  }

  private _preloadThumbnail(postModel: PostModel) {
    const itemIds: number[] = postModel.itemIds.filter((id: number) => {
      return TypeDictionary.TYPE_ID_FILE === GlipTypeUtil.extractTypeId(id);
    });

    if (itemIds && itemIds.length) {
      this._getThumbnailPreloadController().preload(itemIds);
    }
  }

  async doPreFetch(groupId: number) {
    if (this.shouldPreFetch(groupId, QUERY_DIRECTION.OLDER)) {
      const foc = this.get(groupId);
      await foc.fetchData(QUERY_DIRECTION.OLDER);
    }
  }

  get(groupId: number): FetchSortableDataListHandler<Post> {
    let listHandler = this._cacheMap.get(groupId);
    if (!listHandler) {
      const fetchDataCallback = async (delta: TDelta) => {
        if (delta) {
          let sortableModels: ISortableModel[] = [];
          if (delta.added && delta.added.length) {
            sortableModels = sortableModels.concat(delta.added);
          }

          if (delta.updated && delta.updated.length) {
            sortableModels = sortableModels.concat(delta.updated);
          }

          if (sortableModels.length) {
            const postStore = storeManager.getEntityMapStore(
              ENTITY_NAME.POST,
            ) as MultiEntityMapStore<Post, PostModel>;

            await Promise.all(
              sortableModels.map(
                async (sortableModel: ISortableModel<Post>) => {
                  if (
                    sortableModel &&
                    sortableModel.id &&
                    sortableModel.id > 0
                  ) {
                    this._preloadThumbnail(postStore.get(sortableModel.id));
                  }
                },
              ),
            );
          }
        }
      };

      this._cacheDeltaDataHandlerMap.set(groupId, fetchDataCallback);

      listHandler = ConversationPostFocBuilder.buildConversationPostFoc(
        groupId,
        undefined,
        fetchDataCallback,
      );

      this.set(groupId, listHandler);
      listHandler.maintainMode = true;
    }
    return listHandler;
  }

  protected removeInternal(groupId: number) {
    const preloadThumbnail = this._cacheDeltaDataHandlerMap.get(groupId);
    if (preloadThumbnail) {
      this.get(groupId).removeDataChangeCallback(preloadThumbnail);
      this._cacheDeltaDataHandlerMap.delete(groupId);
    }

    super.removeInternal(groupId);
  }

  needToCache(groupId: number) {
    return this.shouldPreFetch(groupId, QUERY_DIRECTION.OLDER);
  }
}

const conversationPostCacheController = new ConversationPostCacheController();
export default conversationPostCacheController;
export { ConversationPostCacheController };
