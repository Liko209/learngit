/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 14:58:12
 * Copyright © RingCentral. All rights reserved.
 */
import { SearchService } from '../SearchService';
import { RecentSearchRecordController } from '../../controller/RecentSearchRecordController';
import { SearchServiceController } from '../../controller/SearchServiceController';
import { RecentSearchTypes } from '../../entity';
import { SearchUserConfig } from '../../config/SearchUserConfig';
import { SearchPersonController } from '../../controller/SearchPersonController';

jest.mock('../../config/SearchUserConfig');
jest.mock('../../controller/SearchServiceController');
jest.mock('../../controller/RecentSearchRecordController');
jest.mock('../../controller/SearchPersonController');

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
      recentSearchRecordController = new RecentSearchRecordController(
        null as any,
      );
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

    it('getRecentSearchRecords', async () => {
      const models = [{ id: 11 }];
      recentSearchRecordController.getRecentSearchRecords = jest
        .fn()
        .mockResolvedValue(models);
      const res = await searchService.getRecentSearchRecords();
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

  describe('doFuzzySearchPersons', () => {
    let searchPersonController: SearchPersonController;
    beforeEach(() => {
      clearMocks();
      setUp();

      searchPersonController = new SearchPersonController(searchService);
      Object.defineProperty(searchService, 'searchPersonController', {
        get: jest.fn(() => searchPersonController),
      });
    });

    it('should call correct parameter', () => {
      const options = {
        searchKey: 'test keys',
        excludeSelf: true,
      };
      searchService.doFuzzySearchPersons(options);
      expect(searchPersonController.doFuzzySearchPersons).toBeCalledWith({
        searchKey: 'test keys',
        excludeSelf: true,
      });
    });
  });

  describe('doFuzzySearchPhoneContacts', () => {
    let searchPersonController: SearchPersonController;
    beforeEach(() => {
      clearMocks();
      setUp();
      searchPersonController = new SearchPersonController(searchService);
      Object.defineProperty(searchService, 'searchPersonController', {
        get: jest.fn(() => searchPersonController),
      });
    });

    it('should call correct parameter', async () => {
      const options = {
        searchKey: 'test keys',
        excludeSelf: true,
      };
      searchService.doFuzzySearchPhoneContacts(options);
      expect(searchPersonController.doFuzzySearchPhoneContacts).toBeCalledWith({
        searchKey: 'test keys',
        excludeSelf: true,
      });
    });
  });
});
