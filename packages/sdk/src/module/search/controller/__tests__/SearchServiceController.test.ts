/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 11:05:09
 * Copyright © RingCentral. All rights reserved.
 */
import { SearchServiceController } from '../SearchServiceController';
import { RecentSearchRecordController } from '../RecentSearchRecordController';
function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SearchServiceController', () => {
  let searchServiceController: SearchServiceController;
  function setUp() {
    searchServiceController = new SearchServiceController();
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('recentSearchRecordController', () => {
    it('get recentSearchRecordController', () => {
      expect(
        searchServiceController.recentSearchRecordController,
      ).toBeInstanceOf(RecentSearchRecordController);
    });
  });
});
