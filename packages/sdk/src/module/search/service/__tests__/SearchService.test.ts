/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 14:58:12
 * Copyright © RingCentral. All rights reserved.
 */
import { SearchService } from '../SearchService';
import { RecentSearchRecordController } from '../../controller/RecentSearchRecordController';
import { SearchServiceController } from '../../controller/SearchServiceController';

jest.mock('../../controller/SearchServiceController');
jest.mock('../../controller/RecentSearchRecordController');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SearchService', () => {
  let searchServiceController: SearchServiceController;
  let searchService: SearchService;
  function setUp() {
    searchService = new SearchService();
    searchServiceController = new SearchServiceController();
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('RecentSearchRecordController', () => {
    let recentSearchRecordController: RecentSearchRecordController;
    beforeEach(() => {
      clearMocks();
      setUp();
      recentSearchRecordController = new RecentSearchRecordController();
      Object.defineProperty(searchService, 'recentSearchRecordController', {
        get: jest.fn(() => recentSearchRecordController),
      });
    });

    it('addRecentSearchRecord', () => {
      const model: any = { id: 11 };
      searchService.addRecentSearchRecord(model);
      expect(recentSearchRecordController.addRecentSearchRecord).toBeCalledWith(
        model,
      );
    });

    it('clearRecentSearchRecords', () => {
      searchService.clearRecentSearchRecords();
      expect(
        recentSearchRecordController.clearRecentSearchRecords,
      ).toBeCalled();
    });

    it('getRecentSearchRecords', () => {
      const models = [{ id: 11 }];
      recentSearchRecordController.getRecentSearchRecords = jest
        .fn()
        .mockReturnValue(models);
      const res = searchService.getRecentSearchRecords();
      expect(recentSearchRecordController.getRecentSearchRecords).toBeCalled();
      expect(res).toEqual(models);
    });

    it('removeRecentSearchRecords', () => {
      const idSet = new Set();
      searchService.removeRecentSearchRecords(idSet);
      expect(
        recentSearchRecordController.removeRecentSearchRecords,
      ).toBeCalledWith(idSet);
    });
  });
});
