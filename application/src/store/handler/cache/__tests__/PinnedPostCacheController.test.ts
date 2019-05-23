/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-02 17:39:20
 * Copyright © RingCentral. All rights reserved.
 */
import { PinnedPostCacheController } from '../PinnedPostCacheController';
import { FetchSortableDataListHandler } from '@/store/base/fetch/FetchSortableDataListHandler';
import { Post } from 'sdk/module/post/entity';
import { SortableListStore } from '@/store/base';
import { QUERY_DIRECTION } from 'sdk/dao';
import { PinnedPostListHandler } from '../../PinnedPostListHandler';

jest.mock('sdk/api');
jest.mock('sdk/dao');
jest.mock('sdk/module/account/config');
jest.mock('@/store/base/fetch/FetchSortableDataListHandler');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('PinnedPostCacheController', () => {
  let pinnedPostCacheController: PinnedPostCacheController;
  let fetchSortableDataListHandler2: FetchSortableDataListHandler<Post>;
  let fetchSortableDataListHandler3: FetchSortableDataListHandler<Post>;
  function setUp() {
    pinnedPostCacheController = new PinnedPostCacheController();
    fetchSortableDataListHandler2 = new FetchSortableDataListHandler(
      null as any,
      null as any,
    );

    fetchSortableDataListHandler3 = new FetchSortableDataListHandler(
      null as any,
      null as any,
    );
    pinnedPostCacheController['_currentGroupId'] = 0;
    pinnedPostCacheController['_cacheMap'] = new Map([
      [2, fetchSortableDataListHandler2],
      [3, fetchSortableDataListHandler3],
    ]);
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('get', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return cache in CacheMap', () => {
      const result = pinnedPostCacheController.get(2);
      expect(result).toBe(fetchSortableDataListHandler2);

      const result2 = pinnedPostCacheController.get(3);
      expect(result2).toBe(fetchSortableDataListHandler3);
    });

    it('should create new one when no cache in CacheMap', () => {
      const id = Date.now();
      const pinnedPostHandler = pinnedPostCacheController.getPinnedPostHandler(
        id,
      );

      expect(pinnedPostHandler).toBeInstanceOf(PinnedPostListHandler);
      expect(
        pinnedPostHandler.fetchSortableDataHandler().maintainMode,
      ).toBeTruthy();
    });
  });

  describe('doPreFetch', () => {
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

      await pinnedPostCacheController.doPreFetch(2);
      expect(fetchSortableDataListHandler2.fetchData).not.toBeCalled();
    });

    it('should not do pre fetch when has data in store', async () => {
      saveItems([{ id: 1 }, { id: 2 }, { id: 3 }]);
      fetchSortableDataListHandler2.hasMore = jest.fn().mockReturnValue(false);

      await pinnedPostCacheController.doPreFetch(2);
      expect(fetchSortableDataListHandler2.fetchData).not.toBeCalled();
    });

    it('should do pre fetch when has more is true and has not fetched data before', async () => {
      saveItems([]);
      fetchSortableDataListHandler2.hasMore = jest.fn().mockReturnValue(true);

      await pinnedPostCacheController.doPreFetch(2);
      expect(fetchSortableDataListHandler2.fetchData).toBeCalled();
    });
  });

  describe('removeInternal', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should call dispose of pinned post  handler when remove a cacahe', () => {
      const pinnedPostHandler = new PinnedPostListHandler(2, []);
      pinnedPostHandler.dispose = jest.fn();
      pinnedPostCacheController['_pinPostHandlerCache'] = new Map([
        [2, pinnedPostHandler],
      ]);
      pinnedPostCacheController['_currentGroupId'] = 3;
      pinnedPostCacheController.remove(2);
      expect(fetchSortableDataListHandler2.dispose).toBeCalled();
      expect(pinnedPostHandler.dispose).toBeCalled();
    });

    it('should not remove data when input group id is same as current group id', () => {
      const pinnedPostHandler = new PinnedPostListHandler(2, []);
      pinnedPostHandler.dispose = jest.fn();
      pinnedPostCacheController['_pinPostHandlerCache'] = new Map([
        [2, pinnedPostHandler],
      ]);
      pinnedPostCacheController['_currentGroupId'] = 2;
      pinnedPostCacheController.remove(2);
      expect(pinnedPostHandler.dispose).not.toBeCalled();
    });
  });
});
