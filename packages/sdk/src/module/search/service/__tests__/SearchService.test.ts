/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 14:58:12
 * Copyright © RingCentral. All rights reserved.
 */
import { SearchService } from '../SearchService';
import { RecentSearchRecordController } from '../../controller/RecentSearchRecordController';
import { SearchServiceController } from '../../controller/SearchServiceController';
import { RecentSearchTypes } from '../../entity';
import { SearchUserConfig } from '../../config';

jest.mock('../../config');
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
    searchServiceController = new SearchServiceController(searchService);
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('userConfig', () => {
    it('should create userConfig', () => {
      searchService.userConfig;
      expect(SearchUserConfig).toBeCalled();
    });
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
      const theType: any = 'people';
      searchService.addRecentSearchRecord(theType, 123);
      expect(recentSearchRecordController.addRecentSearchRecord).toBeCalledWith(
        theType,
        123,
        {},
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

    it('getRecentSearchRecordsByType', () => {
      searchService.getRecentSearchRecordsByType(RecentSearchTypes.GROUP);
      expect(
        recentSearchRecordController.getRecentSearchRecordsByType,
      ).toBeCalledWith(RecentSearchTypes.GROUP);
    });
  });
});
