/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-08-17 15:21:02
 * Copyright © RingCentral. All rights reserved.
 */

import { PostCacheController } from './PostCacheController';
import { FetchSortableDataListHandler } from '@/store/base';
import { Post } from 'sdk/module/post/entity';
import { QUERY_DIRECTION } from 'sdk/dao';
import { mainLogger } from 'foundation/log';
import { DiscontinuousPosListHandler } from '../DiscontinuousPosListHandler';
import { DEFAULT_PAGE_SIZE } from '../constant';

class DiscontinuousPostCacheController extends PostCacheController {
  constructor() {
    super();
  }

  protected getSourceIds(): number[] {
    return [];
  }

  name() {
    return 'DiscontinuousPostCacheController';
  }

  get(id: number): FetchSortableDataListHandler<Post> {
    if (!this._cacheMap.has(id)) {
      this.initDiscontinuousHandler(id);
    }

    return this._cacheMap.get(id)!;
  }

  protected initDiscontinuousHandler(id: number) {
    const discontinuousPosListHandler = new DiscontinuousPosListHandler(
      this.getSourceIds(),
      undefined,
      DEFAULT_PAGE_SIZE,
    );

    const listHandler = discontinuousPosListHandler.fetchSortableDataHandler();
    this.set(id, listHandler);
    listHandler.maintainMode = true;
  }

  async doPreFetch(id: number) {
    if (this.shouldPreFetch(id, QUERY_DIRECTION.NEWER)) {
      const foc = this.get(id);
      await foc.fetchData(QUERY_DIRECTION.NEWER);
      mainLogger.tags(this.name()).info('doPrefetch done - ', id);
    }
  }

  needToCache(id: number) {
    return this.shouldPreFetch(id, QUERY_DIRECTION.NEWER);
  }
}

export { DiscontinuousPostCacheController };
