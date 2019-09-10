/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-02 17:39:20
 * Copyright © RingCentral. All rights reserved.
 */
import { PinnedPostCacheController } from '../PinnedPostCacheController';
import { FetchSortableDataListHandler } from '@/store/base/fetch/FetchSortableDataListHandler';
import { Post } from 'sdk/module/post/entity';
import { PinnedPostListHandler } from '../../PinnedPostListHandler';
import { observable } from 'mobx';

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

describe('PinnedPostCacheController', () => {
  let pinnedPostCacheController: PinnedPostCacheController;
  let fetchSortableDataListHandler2: FetchSortableDataListHandler<Post>;
  let fetchSortableDataListHandler3: FetchSortableDataListHandler<Post>;
  function setUp() {
    observable.map = jest.fn().mockReturnValue(new Map());
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

    it('should create new one when no cache in CacheMap', () => {
      const id = Date.now();
      pinnedPostCacheController.get(id);
      const pinnedPostHandler = pinnedPostCacheController[
        '_pinPostHandlerCache'
      ].get(id);
      expect(pinnedPostHandler).toBeInstanceOf(PinnedPostListHandler);
      expect(
        pinnedPostHandler &&
          pinnedPostHandler.fetchSortableDataHandler().maintainMode,
      ).toBeTruthy();
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
      expect(fetchSortableDataListHandler2.dispose).toHaveBeenCalled();
      expect(pinnedPostHandler.dispose).toHaveBeenCalled();
    });

    it('should not remove data when input group id is same as current group id', () => {
      const pinnedPostHandler = new PinnedPostListHandler(2, []);
      pinnedPostHandler.dispose = jest.fn();
      pinnedPostCacheController['_pinPostHandlerCache'] = new Map([
        [2, pinnedPostHandler],
      ]);
      pinnedPostCacheController['_currentGroupId'] = 2;
      pinnedPostCacheController.remove(2);
      expect(pinnedPostHandler.dispose).not.toHaveBeenCalled();
    });
  });
});
