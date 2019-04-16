/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-01 18:26:44
 * Copyright © RingCentral. All rights reserved.
 */

import { FetchSortableDataListHandler } from '@/store/base';
import { Post } from 'sdk/module/post/entity';
import GroupModel from '@/store/models/Group';
import _ from 'lodash';
import { PostCacheController } from './PostCacheController';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { PinnedPostListHandler } from '../PinnedPostListHandler';
import { QUERY_DIRECTION } from 'sdk/dao';
import { mainLogger } from 'sdk';

const LOG_TAG = 'PinnedPostCacheController';
class PinnedPostCacheController extends PostCacheController {
  private _pinPostHandlerCache: Map<number, PinnedPostListHandler>;

  constructor() {
    super();
    this._pinPostHandlerCache = new Map();
  }

  name() {
    return 'PinnedPostCacheController';
  }

  get(groupId: number): FetchSortableDataListHandler<Post> {
    if (!this._cacheMap.has(groupId)) {
      this._initPinnedPostHandler(groupId);
    }

    return this._cacheMap.get(groupId)!;
  }

  getPinnedPostHandler(groupId: number) {
    if (!this._pinPostHandlerCache.has(groupId)) {
      this._initPinnedPostHandler(groupId);
    }

    return this._pinPostHandlerCache.get(groupId)!;
  }

  private _initPinnedPostHandler(groupId: number) {
    const groupModel = getEntity(ENTITY_NAME.GROUP, groupId) as GroupModel;
    const pinnedPostIds = groupModel.pinnedPostIds;
    const pinnedPostListHandler = new PinnedPostListHandler(
      groupId,
      pinnedPostIds,
    );

    const listHandler = pinnedPostListHandler.fetchSortableDataHandler();
    this._pinPostHandlerCache.set(groupId, pinnedPostListHandler);
    this.set(groupId, listHandler);
    listHandler.maintainMode = true;
  }

  protected removeInternal(groupId: number) {
    const pinnedPostHandler = this._pinPostHandlerCache.get(groupId);
    if (pinnedPostHandler) {
      pinnedPostHandler.dispose();
      this._pinPostHandlerCache.delete(groupId);
    }

    super.removeInternal(groupId);
  }

  async doPreFetch(groupId: number) {
    if (this.shouldPreFetch(groupId, QUERY_DIRECTION.NEWER)) {
      const foc = this.get(groupId);
      await foc.fetchData(QUERY_DIRECTION.NEWER);
      mainLogger.info(LOG_TAG, 'doPrefetch done - ', groupId);
    }
  }

  needToCache(groupId: number) {
    return this.shouldPreFetch(groupId, QUERY_DIRECTION.NEWER);
  }
}

const pinnedPostCacheController = new PinnedPostCacheController();

export default pinnedPostCacheController;
export { PinnedPostCacheController };
