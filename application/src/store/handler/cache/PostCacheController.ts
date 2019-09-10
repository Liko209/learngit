/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2019-02-04 10:02:00
 * Copyright © RingCentral. All rights reserved.
 */

import { FetchSortableDataListHandler } from '@/store/base';
import { Post } from 'sdk/module/post/entity';
import storeManager from '@/store/base/StoreManager';
import { ENTITY_NAME } from '@/store';
import { Item } from 'sdk/module/item/entity';
import { mainLogger } from 'foundation/log';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import PostModel from '@/store/models/Post';
import _ from 'lodash';
import ItemModel from '@/store/models/Item';
import { IPreFetchController } from '@/store/handler/cache/interface/IPreFetchController';
import { QUERY_DIRECTION } from 'sdk/dao';
import { PostUsedItemCache } from './PostUsedItemCache';

abstract class PostCacheController implements IPreFetchController {
  protected _cacheMap: Map<number, FetchSortableDataListHandler<Post>>;
  protected _currentGroupId: number = 0;
  protected _postUsedItemCache = new PostUsedItemCache();

  constructor() {
    this._cacheMap = new Map();

    (storeManager.getEntityMapStore(ENTITY_NAME.POST) as MultiEntityMapStore<
      Post,
      PostModel
    >).addUsedCache(this);

    (storeManager.getEntityMapStore(ENTITY_NAME.ITEM) as MultiEntityMapStore<
      Item,
      ItemModel
    >).addUsedCache(this._postUsedItemCache);
  }

  abstract get(groupId: number): FetchSortableDataListHandler<Post>;

  abstract doPreFetch(groupId: number): Promise<void>;

  abstract needToCache(groupId: number): boolean;

  name() {
    return 'PostCacheController';
  }

  getUsedIds(): number[] {
    const handlerArr = Array.from(this._cacheMap.values());
    const idsArr = handlerArr.map(
      (handler: FetchSortableDataListHandler<Post>) => {
        const items = handler.sortableListStore.items;
        return _.map(items, 'id');
      },
    );
    return _.union(...idsArr);
  }

  hasCache(groupId: number): boolean {
    return this._cacheMap.has(groupId);
  }

  getUnCachedGroupIds(): number[] {
    const needCacheGroupIds: number[] = [];
    this._cacheMap.forEach(
      (value: FetchSortableDataListHandler<Post>, key: number) => {
        this.needToCache(key) && needCacheGroupIds.push(key);
      },
    );
    return needCacheGroupIds;
  }

  setCurrentCacheConversation(groupId: number) {
    if (this._currentGroupId !== groupId) {
      if (this.hasCache(this._currentGroupId)) {
        mainLogger.debug(
          `PostCacheController: setCurrentCacheConversation original =>  ${
            this._currentGroupId
          }`,
        );
        this.get(this._currentGroupId).maintainMode = true;
      }

      if (this.hasCache(groupId)) {
        mainLogger.debug(
          `PostCacheController: setCurrentCacheConversation new => ${groupId}`,
        );
        this.get(groupId).maintainMode = false;
      }

      this._currentGroupId = groupId;
    }
  }

  releaseCurrentConversation(groupId: number) {
    if (this._currentGroupId === groupId) {
      this._currentGroupId = 0;
    } else if (this.hasCache(groupId)) {
      mainLogger.debug(
        `PostCacheController: releaseCurrentConversation =>  ${groupId}`,
      );
      this.get(groupId).maintainMode = true;
    }
  }

  set(groupId: number, listHandler: FetchSortableDataListHandler<Post>) {
    this._cacheMap.set(groupId, listHandler);
  }

  remove(groupId: number) {
    if (this.hasCache(groupId)) {
      if (this._currentGroupId !== groupId) {
        this.removeInternal(groupId);
      }
    }
  }

  protected shouldPreFetch(groupId: number, direction: QUERY_DIRECTION) {
    if (this.isInRange(groupId)) {
      if (this.hasCache(groupId)) {
        const foc = this.get(groupId);
        return foc.hasMore(direction) && foc.listStore.size === 0;
      }
      return true;
    }
    return false;
  }

  protected removeInternal(groupId: number) {
    this.get(groupId).dispose();
    this._cacheMap.delete(groupId);
  }

  isInRange(groupId: number): boolean {
    return groupId > 0;
  }
}

export { PostCacheController };
