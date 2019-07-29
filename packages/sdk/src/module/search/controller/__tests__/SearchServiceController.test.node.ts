/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 11:05:09
 * Copyright © RingCentral. All rights reserved.
 */
import { SearchServiceController } from '../SearchServiceController';
import { RecentSearchRecordController } from '../RecentSearchRecordController';
import { ISearchService } from '../../service/ISearchService';
function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SearchServiceController', () => {
  let searchServiceController: SearchServiceController;
  let searchService: ISearchService;
  function setUp() {
    searchService = jest.fn().mockReturnValue({
      getRecentSearchRecordsMap: jest.fn(),
    }) as any;
    searchServiceController = new SearchServiceController(searchService);
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
