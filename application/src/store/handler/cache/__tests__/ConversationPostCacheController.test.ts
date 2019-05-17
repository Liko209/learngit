/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-02 17:58:38
 * Copyright © RingCentral. All rights reserved.
 */

import { ConversationPostCacheController } from '../ConversationPostCacheController';
import { FetchSortableDataListHandler } from '@/store/base/fetch/FetchSortableDataListHandler';
import { Post } from 'sdk/module/post/entity';
import { SortableListStore } from '@/store/base';
import { QUERY_DIRECTION } from 'sdk/dao';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('sdk/api');
jest.mock('@/store/base/fetch/FetchSortableDataListHandler');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('ConversationPostCacheController', () => {
  let conversationPostCacheController: ConversationPostCacheController;
  let fetchSortableDataListHandler2: FetchSortableDataListHandler<Post>;
  let fetchSortableDataListHandler3: FetchSortableDataListHandler<Post>;
  function setUp() {
    jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
      getPostsByGroupId: jest.fn().mockResolvedValue([]),
    });
    fetchSortableDataListHandler2 = new FetchSortableDataListHandler(
      null as any,
      null as any,
    );

    fetchSortableDataListHandler3 = new FetchSortableDataListHandler(
      null as any,
      null as any,
    );
    conversationPostCacheController = new ConversationPostCacheController();
    conversationPostCacheController['_currentGroupId'] = 0;
    conversationPostCacheController['_cacheMap'] = new Map([
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
      const result = conversationPostCacheController.get(2);
      expect(result).toBe(fetchSortableDataListHandler2);

      const result2 = conversationPostCacheController.get(3);
      expect(result2).toBe(fetchSortableDataListHandler3);
    });

    it('should create new one when no cache in CacheMap', () => {
      const result = conversationPostCacheController.get(Date.now());
      expect(result).toBeInstanceOf(FetchSortableDataListHandler);
    });
  });

  describe('removeInternal', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should remove data change call back from foc and delete _cacheDeltaDataHandlerMap', () => {
      conversationPostCacheController['_cacheDeltaDataHandlerMap'] = new Map([
        [2, jest.fn()],
        [3, jest.fn()],
      ]);
      conversationPostCacheController['_currentGroupId'] = 3;
      conversationPostCacheController.remove(2);
      expect(
        fetchSortableDataListHandler2.removeDataChangeCallback,
      ).toBeCalled();
    });

    it('should not remove data when input group id is same as current group id', () => {
      conversationPostCacheController['_cacheDeltaDataHandlerMap'] = new Map([
        [2, jest.fn()],
        [3, jest.fn()],
      ]);
      conversationPostCacheController['_currentGroupId'] = 3;
      conversationPostCacheController.remove(3);
      expect(
        fetchSortableDataListHandler2.removeDataChangeCallback,
      ).not.toBeCalled();
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
          return QUERY_DIRECTION.OLDER !== direction;
        });

      await conversationPostCacheController.doPreFetch(2);
      expect(fetchSortableDataListHandler2.fetchData).not.toBeCalled();
    });

    it('should not do pre fetch when has data in store', async () => {
      saveItems([{ id: 1 }, { id: 2 }, { id: 3 }]);
      fetchSortableDataListHandler2.hasMore = jest.fn().mockReturnValue(false);

      await conversationPostCacheController.doPreFetch(2);
      expect(fetchSortableDataListHandler2.fetchData).not.toBeCalled();
    });

    it('should do pre fetch when has more is true and has not fetched data before', async () => {
      saveItems([]);
      fetchSortableDataListHandler2.hasMore = jest.fn().mockReturnValue(true);

      await conversationPostCacheController.doPreFetch(2);
      expect(fetchSortableDataListHandler2.fetchData).toBeCalled();
    });
  });
});
