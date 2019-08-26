/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-08-19 09:49:30
 * Copyright © RingCentral. All rights reserved.
 */

import { AtMentionCacheController } from '../AtMentionCacheController';

jest.mock('@/store/base/fetch/FetchSortableDataListHandler');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('BookmarkCacheController', () => {
  let atMentionCacheController: AtMentionCacheController;
  function setUp() {
    atMentionCacheController = new AtMentionCacheController();
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

    it('should return false if id = -101', () => {
      const result = atMentionCacheController.isInRange(-101);
      expect(result).toEqual(true);
    });

    it('should return true if id != -101', () => {
      const result = atMentionCacheController.isInRange(1);
      expect(result).toEqual(false);
    });
  });
});
