/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-08-17 15:28:06
 * Copyright © RingCentral. All rights reserved.
 */

import { FetchSortableDataListHandler } from '@/store/base/fetch/FetchSortableDataListHandler';
import { Post } from 'sdk/module/post/entity';
import { SortableListStore } from '@/store/base';
import { QUERY_DIRECTION } from 'sdk/dao';
import { observable } from 'mobx';
import { DiscontinuousPostCacheController } from '../DiscontinuousPostCacheController';
import { DiscontinuousPosListHandler } from '../../DiscontinuousPosListHandler';

jest.mock('mobx');
jest.mock('sdk/api');
jest.mock('sdk/dao');
jest.mock('sdk/module/account/config');
jest.mock('@/store/base/fetch/FetchSortableDataListHandler');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('DiscontinuousPostCacheController', () => {
  let discontinuousPostCacheController: DiscontinuousPostCacheController;
  let fetchSortableDataListHandler2: FetchSortableDataListHandler<Post>;
  let fetchSortableDataListHandler3: FetchSortableDataListHandler<Post>;
  function setUp() {
    observable.map = jest.fn().mockReturnValue(new Map());
    discontinuousPostCacheController = new DiscontinuousPostCacheController();
    fetchSortableDataListHandler2 = new FetchSortableDataListHandler(
      null as any,
      null as any,
    );

    fetchSortableDataListHandler3 = new FetchSortableDataListHandler(
      null as any,
      null as any,
    );
    discontinuousPostCacheController['_currentGroupId'] = 0;
    discontinuousPostCacheController['_cacheMap'] = new Map([
      [2, fetchSortableDataListHandler2],
      [3, fetchSortableDataListHandler3],
    ]);
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('get()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return cache in CacheMap', () => {
      const result = discontinuousPostCacheController.get(2);
      expect(result).toBe(fetchSortableDataListHandler2);

      const result2 = discontinuousPostCacheController.get(3);
      expect(result2).toBe(fetchSortableDataListHandler3);
    });

    it('should create new one when no cache in CacheMap', () => {
      const spy = jest.spyOn(
        discontinuousPostCacheController,
        'initDiscontinuousHandler',
      );
      const id = Date.now();
      const result = discontinuousPostCacheController.get(id);
      expect(spy).toHaveBeenCalled();
      expect(result).toBeInstanceOf(FetchSortableDataListHandler);
      expect(result.maintainMode).toBeTruthy();
    });
  });

  describe('doPreFetch()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    function saveItems(items: any) {
      const sortableListStore = new SortableListStore();
      sortableListStore['_items'] = items;

      Object.defineProperty(fetchSortableDataListHandler2, 'listStore', {
        get: jest.fn(() => sortableListStore),
      });
    }

    it('should not do pre fetch when has more is false', async () => {
      saveItems([]);

      fetchSortableDataListHandler2.hasMore = jest
        .fn()
        .mockImplementation((direction: any) => {
          return QUERY_DIRECTION.NEWER !== direction;
        });

      await discontinuousPostCacheController.doPreFetch(2);
      expect(fetchSortableDataListHandler2.fetchData).not.toHaveBeenCalled();
    });

    it('should not do pre fetch when has data in store', async () => {
      saveItems([{ id: 1 }, { id: 2 }, { id: 3 }]);
      fetchSortableDataListHandler2.hasMore = jest.fn().mockReturnValue(false);

      await discontinuousPostCacheController.doPreFetch(2);
      expect(fetchSortableDataListHandler2.fetchData).not.toHaveBeenCalled();
    });

    it('should do pre fetch when has more is true and has not fetched data before', async () => {
      saveItems([]);
      fetchSortableDataListHandler2.hasMore = jest.fn().mockReturnValue(true);

      await discontinuousPostCacheController.doPreFetch(2);
      expect(fetchSortableDataListHandler2.fetchData).toHaveBeenCalled();
    });
  });

  describe('needToCache()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return false if has cache', () => {
      const spy = jest.spyOn(
        discontinuousPostCacheController,
        'shouldPreFetch',
      );
      discontinuousPostCacheController.needToCache(2);
      expect(spy).toHaveBeenCalled();
    });
  });
});
