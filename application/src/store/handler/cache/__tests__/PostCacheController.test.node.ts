/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2019-02-04 10:02:33
 * Copyright © RingCentral. All rights reserved.
 */

import { PostCacheController } from '../PostCacheController';
import { FetchSortableDataListHandler } from '@/store/base/fetch/FetchSortableDataListHandler';
import { Post } from 'sdk/module/post/entity';
import { SortableListStore } from '@/store/base';

jest.mock('sdk/api');
jest.mock('@/store/base/fetch/FetchSortableDataListHandler');

class ExtendPostCacheController extends PostCacheController {
  get(groupId: number): FetchSortableDataListHandler<Post> {
    return (
      this._cacheMap.get(groupId) ||
      new FetchSortableDataListHandler(null as any, null as any)
    );
  }

  async doPreFetch(groupId: number) {}

  needToCache() {
    return true;
  }
}

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('PostCacheController', () => {
  let postCacheController: ExtendPostCacheController;
  let fetchSortableDataListHandler2: FetchSortableDataListHandler<Post>;
  let fetchSortableDataListHandler3: FetchSortableDataListHandler<Post>;
  function setUp() {
    fetchSortableDataListHandler2 = new FetchSortableDataListHandler(
      null as any,
      null as any,
    );

    fetchSortableDataListHandler3 = new FetchSortableDataListHandler(
      null as any,
      null as any,
    );
    postCacheController = new ExtendPostCacheController();
    postCacheController['_currentGroupId'] = 0;
    postCacheController['_cacheMap'] = new Map([
      [2, fetchSortableDataListHandler2],
      [3, fetchSortableDataListHandler3],
    ]);
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('hasCache', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return true when has cache ', () => {
      const result = postCacheController.hasCache(2);
      expect(result).toBeTruthy();
    });

    it('should return false when do not has cache ', () => {
      const result = postCacheController.hasCache(Date.now());
      expect(result).toBeFalsy();
    });
  });

  describe('get()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return listHandler when has the list handler in cache map', () => {
      const result = postCacheController.get(2);
      expect(result).toBe(fetchSortableDataListHandler2);
    });

    it('should create and return FetchSortableDataListHandler type when groupId not in cacheMap', () => {
      const result = postCacheController.get(Date.now());
      expect(result instanceof FetchSortableDataListHandler).toBeTruthy();
      expect(result).not.toEqual(fetchSortableDataListHandler2);
    });
  });

  describe('setCurrentCacheConversation', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should update maintain status when current group id is not input group id ', () => {
      fetchSortableDataListHandler2.maintainMode = false;
      fetchSortableDataListHandler3.maintainMode = true;
      postCacheController['_currentGroupId'] = 2;
      postCacheController.setCurrentCacheConversation(3);
      expect(fetchSortableDataListHandler2.maintainMode).toBeTruthy();
      expect(fetchSortableDataListHandler3.maintainMode).toBeFalsy();
      expect(postCacheController['_currentGroupId']).toEqual(3);
    });
  });

  describe('releaseCurrentConversation()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should not remove groupId but set maintain mode to true when groupId is not currentGroupId', () => {
      postCacheController['_currentGroupId'] = 2;
      expect(fetchSortableDataListHandler3.maintainMode).toBeFalsy();
      postCacheController.releaseCurrentConversation(3);
      expect(postCacheController.hasCache(2)).toBeTruthy();
      expect(postCacheController.hasCache(3)).toBeTruthy();
      expect(fetchSortableDataListHandler3.maintainMode).toBeTruthy();
    });

    it('should remove groupId from cache when groupId is currentGroupId', () => {
      postCacheController['_currentGroupId'] = 2;
      postCacheController.releaseCurrentConversation(2);
      expect(postCacheController['_currentGroupId']).toBe(0);
    });

    it('should do nothing when group id does not exist in cache', () => {
      postCacheController['_currentGroupId'] = 2;
      expect(postCacheController.hasCache(2)).toBeTruthy();
      expect(postCacheController.hasCache(3)).toBeTruthy();

      postCacheController.releaseCurrentConversation(Date.now());

      expect(postCacheController.hasCache(2)).toBeTruthy();
      expect(postCacheController.hasCache(3)).toBeTruthy();
    });
  });

  describe('set', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should add handler when set new handler', () => {
      const handler = new FetchSortableDataListHandler<Post>(
        null as any,
        null as any,
      );
      postCacheController.set(3, handler);

      expect(postCacheController.get(3)).toBe(handler);
    });
  });

  describe('remove()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should not remove groupId from cache when groupId not in cacheMap', () => {
      postCacheController.remove(Date.now());
      expect(postCacheController.hasCache(2)).toBeTruthy();
      expect(postCacheController.hasCache(3)).toBeTruthy();
    });

    it('should remove groupId from cache when groupId in cacheMap and not current groupId', () => {
      expect(postCacheController.hasCache(2)).toBeTruthy();
      postCacheController.remove(2);
      expect(fetchSortableDataListHandler2.dispose).toHaveBeenCalled();
      expect(postCacheController.hasCache(2)).toBeFalsy();
    });

    it('should not remove groupId from cache when groupId in cacheMap and is current groupId', () => {
      postCacheController['_currentGroupId'] = 2;
      postCacheController.remove(2);
      expect(postCacheController.hasCache(2)).toBeTruthy();
    });
  });

  describe('getUnCachedGroupIds', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return all un cached group ids ', () => {
      postCacheController.needToCache = jest
        .fn()
        .mockImplementation((id: number) => {
          return id === 2;
        });
      const res = postCacheController.getUnCachedGroupIds();
      expect(res).toEqual([2]);
    });
  });

  describe('getUsedIds', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return all used ids', () => {
      const sortableListStore = new SortableListStore();
      sortableListStore['_items'] = [{ id: 1 }, { id: 2 }, { id: 3 }] as any;

      Object.defineProperty(
        fetchSortableDataListHandler2,
        'sortableListStore',
        {
          get: jest.fn(() => sortableListStore),
        },
      );

      Object.defineProperty(
        fetchSortableDataListHandler3,
        'sortableListStore',
        {
          get: jest.fn(() => sortableListStore),
        },
      );

      expect(postCacheController.getUsedIds()).toEqual([1, 2, 3]);
    });
  });

  describe('isInRange()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return false if id < 0', () => {
      const result = postCacheController.isInRange(-1);
      expect(result).toEqual(false);
    });

    it('should return true if id > 0', () => {
      const result = postCacheController.isInRange(1);
      expect(result).toEqual(true);
    });
  });
});
