/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-08-19 09:49:30
 * Copyright © RingCentral. All rights reserved.
 */

import { BookmarkCacheController } from '../BookmarkCacheController';
import storeManager from '@/store';

jest.mock('@/store');
jest.mock('@/store/base/fetch/FetchSortableDataListHandler');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('BookmarkCacheController', () => {
  let bookmarkCacheController: BookmarkCacheController;
  function setUp() {
    bookmarkCacheController = new BookmarkCacheController();
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('isInRange()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return false if id = -100', () => {
      const result = bookmarkCacheController.isInRange(-100);
      expect(result).toEqual(true);
    });

    it('should return true if id != -100', () => {
      const result = bookmarkCacheController.isInRange(1);
      expect(result).toEqual(false);
    });
  });
});
