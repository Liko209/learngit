/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2019-02-04 10:02:00
 * Copyright © RingCentral. All rights reserved.
 */

import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  ISortableModel,
} from '@/store/base';
import { Post } from 'sdk/module/post/entity';
import { PostService } from 'sdk/module/post';
import { QUERY_DIRECTION } from 'sdk/dao';
import storeManager, { ENTITY_NAME } from '@/store';
import { ENTITY, notificationCenter, WINDOW } from 'sdk/service';
import { Item } from 'sdk/module/item/entity';
import GlipTypeUtil from 'sdk/utils/glip-type-dictionary/util';
import { TypeDictionary } from 'sdk/utils';
import SequenceProcessorHandler from 'sdk/framework/processor/SequenceProcessorHandler';
import PrefetchPostProcessor from '@/store/handler/PrefetchPostProcessor';

const isMatchedFunc = (groupId: number) => (dataModel: Post) =>
  dataModel.group_id === Number(groupId) && !dataModel.deactivated;
class PostDataProvider implements IFetchSortableDataProvider<Post> {
  private _postService: PostService = PostService.getInstance();
  private _itemStoreMap = new Map<number, ENTITY_NAME>();

  constructor(private _groupId: number) {
    this._itemStoreMap.set(TypeDictionary.TYPE_ID_FILE, ENTITY_NAME.FILE_ITEM);
    this._itemStoreMap.set(TypeDictionary.TYPE_ID_TASK, ENTITY_NAME.TASK_ITEM);
    this._itemStoreMap.set(TypeDictionary.TYPE_ID_LINK, ENTITY_NAME.LINK_ITEM);
    this._itemStoreMap.set(TypeDictionary.TYPE_ID_PAGE, ENTITY_NAME.NOTE_ITEM);
    this._itemStoreMap.set(TypeDictionary.TYPE_ID_CODE, ENTITY_NAME.CODE_ITEM);
    this._itemStoreMap.set(
      TypeDictionary.TYPE_ID_EVENT,
      ENTITY_NAME.EVENT_ITEM,
    );
    this._itemStoreMap.set(
      TypeDictionary.TYPE_ID_CONFERENCE,
      ENTITY_NAME.CONFERENCE_ITEM,
    );
  }
  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModel<Post>,
  ): Promise<{ data: Post[]; hasMore: boolean }> {
    const { posts, hasMore, items } = await this._postService.getPostsByGroupId(
      {
        direction,
        groupId: this._groupId,
        postId: anchor && anchor.id,
        limit: pageSize,
      },
    );
    items.forEach((item: Item) => {
      const type = GlipTypeUtil.extractTypeId(item.id);
      const entityName = this._itemStoreMap.get(type);
      if (entityName) {
        storeManager.dispatchUpdatedDataModels(entityName, [item]);
      } else {
        storeManager.dispatchUpdatedDataModels(ENTITY_NAME.ITEM, [item]);
      }
    });
    return { hasMore, data: posts };
  }
}

class PostCacheController {
  private _cacheMap: Map<number, FetchSortableDataListHandler<Post>>;
  private _prefetchHandler: SequenceProcessorHandler;

  private _currentGroupId: number = 0;

  constructor() {
    this._cacheMap = new Map();
    this._prefetchHandler = new SequenceProcessorHandler(
      'SequenceProcessorHandler',
    );

    notificationCenter.on(WINDOW.ONLINE, ({ onLine }) => {
      this.onNetWorkChanged(onLine);
    });
  }

  onNetWorkChanged(onLine: boolean) {
    if (onLine) {
      for (const groupId of this._cacheMap.keys()) {
        const processor = new PrefetchPostProcessor(
          groupId,
          this.fetchDataFunc,
        );
        this._prefetchHandler.addProcessor(processor);
      }
    }
  }

  fetchDataFunc = async (groupId: number) => {
    if (this._shouldDoPreload(groupId, QUERY_DIRECTION.OLDER)) {
      await this.get(groupId).fetchData(QUERY_DIRECTION.OLDER);
    }
    return Promise.resolve(true);
  }

  private _shouldDoPreload(groupId: number, direction: QUERY_DIRECTION) {
    if (this.has(groupId)) {
      const listHandler = this.get(groupId);
      return listHandler.hasMore(direction) && listHandler.listStore.size === 0;
    }
    return true;
  }

  has(groupId: number): boolean {
    return this._cacheMap.has(groupId);
  }

  get(
    groupId: number,
    jump2PostId?: number,
  ): FetchSortableDataListHandler<Post> {
    let listHandler = !!jump2PostId ? undefined : this._cacheMap.get(groupId);
    if (!listHandler) {
      const options = {
        transformFunc: (dataModel: Post) => ({
          id: dataModel.id,
          sortValue: dataModel.created_at,
          data: dataModel,
        }),
        hasMoreUp: true,
        hasMoreDown: !!jump2PostId,
        isMatchFunc: isMatchedFunc(groupId),
        entityName: ENTITY_NAME.POST,
        eventName: ENTITY.POST,
      };

      listHandler = new FetchSortableDataListHandler(
        new PostDataProvider(groupId),
        options,
      );

      if (!jump2PostId) {
        this.set(groupId, listHandler);
      }
    }
    return listHandler;
  }

  setCurrentConversation(groupId: number) {
    this._currentGroupId = groupId;
  }

  releaseCurrentConversation(groupId: number) {
    if (this._currentGroupId === groupId) {
      this.get(groupId).dispose();
      this._cacheMap.delete(groupId);
      this._currentGroupId = 0;
    }
  }

  set(groupId: number, listHandler: FetchSortableDataListHandler<Post>) {
    this._cacheMap.set(groupId, listHandler);
  }

  remove(groupId: number) {
    if (this.has(groupId)) {
      if (this._currentGroupId !== groupId) {
        this.get(groupId).dispose();
        this._cacheMap.delete(groupId);
      }
    }
  }
}

const postCacheController = new PostCacheController();

export { PostCacheController };
export default postCacheController;
