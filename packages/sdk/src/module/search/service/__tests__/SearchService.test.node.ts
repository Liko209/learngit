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
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { SortableModel, IdModel } from 'sdk/framework/model';
import { Group } from 'sdk/module/group';
import { SortUtils } from 'sdk/framework/utils';

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
      expect(SearchUserConfig).toHaveBeenCalled();
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
      expect(
        recentSearchRecordController.addRecentSearchRecord,
      ).toHaveBeenCalledWith(theType, 123, {});
    });

    it('clearRecentSearchRecords', () => {
      searchService.clearRecentSearchRecords();
      expect(
        recentSearchRecordController.clearRecentSearchRecords,
      ).toHaveBeenCalled();
    });

    it('getRecentSearchRecords', async () => {
      const models = [{ id: 11 }];
      recentSearchRecordController.getRecentSearchRecords = jest
        .fn()
        .mockResolvedValue(models);
      const res = await searchService.getRecentSearchRecords();
      expect(
        recentSearchRecordController.getRecentSearchRecords,
      ).toHaveBeenCalled();
      expect(res).toEqual(models);
    });

    it('removeRecentSearchRecords', () => {
      const idSet = new Set();
      searchService.removeRecentSearchRecords(idSet);
      expect(
        recentSearchRecordController.removeRecentSearchRecords,
      ).toHaveBeenCalledWith(idSet);
    });

    it('getRecentSearchRecordsByType', () => {
      searchService.getRecentSearchRecordsByType(RecentSearchTypes.GROUP);
      expect(
        recentSearchRecordController.getRecentSearchRecordsByType,
      ).toHaveBeenCalledWith(RecentSearchTypes.GROUP);
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
        excludeSelf: true,
      };
      searchService.doFuzzySearchPersons('test keys', options);
      expect(searchPersonController.doFuzzySearchPersons).toHaveBeenCalledWith(
        'test keys',
        {
          excludeSelf: true,
        },
      );
    });
  });

  describe('doFuzzySearchPersonsAndGroups', () => {
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
        excludeSelf: true,
      };

      const sortFunc = (
        lsh: SortableModel<IdModel>,
        rsh: SortableModel<IdModel>,
      ) => {
        return 1;
      };

      searchService.doFuzzySearchPersonsAndGroups(
        'test keys',
        options,
        {},
        sortFunc,
      );
      expect(
        searchPersonController.doFuzzySearchPersonsAndGroups,
      ).toHaveBeenCalledWith(
        'test keys',
        {
          excludeSelf: true,
        },
        {},
        sortFunc,
      );
    });

    it('should call correct parameter when sortFunc is undefined', () => {
      const options = {
        excludeSelf: true,
      };
      searchService.doFuzzySearchPersonsAndGroups('test keys', options, {});
      expect(
        searchPersonController.doFuzzySearchPersonsAndGroups,
      ).toHaveBeenCalledWith(
        'test keys',
        {
          excludeSelf: true,
        },
        {},
        undefined,
      );
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
        excludeSelf: true,
      };
      searchService.doFuzzySearchPhoneContacts('test keys', options);
      expect(
        searchPersonController.doFuzzySearchPhoneContacts,
      ).toHaveBeenCalledWith('test keys', {
        excludeSelf: true,
      });
    });
  });

  describe('doFuzzySearchAllGroups', () => {
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
      const sortFunc = (
        groupA: SortableModel<Group>,
        groupB: SortableModel<Group>,
      ) => {
        return SortUtils.compareSortableModel<Group>(groupA, groupB);
      };

      const option = {
        fetchAllIfSearchKeyEmpty: true,
        myGroupsOnly: true,
        recentFirst: true,
        sortFunc,
      };

      const searchKey: string = 'test keys';
      const fetchAllIfSearchKeyEmpty: boolean = true;
      const myGroupsOnly: boolean = true;
      const recentFirst: boolean = true;

      const groupService = {
        doFuzzySearchAllGroups: jest.fn(),
      };

      ServiceLoader.getInstance = jest.fn().mockImplementation(() => {
        return groupService;
      });

      await searchService.doFuzzySearchAllGroups(searchKey, {
        fetchAllIfSearchKeyEmpty,
        myGroupsOnly,
        recentFirst,
        sortFunc,
      });
      expect(groupService.doFuzzySearchAllGroups).toHaveBeenCalledWith(
        searchKey,
        option,
      );
    });
  });

  describe('generateMatchInfo', () => {
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
      const terms = {
        searchKey: 'Dora Chen ',
        searchKeyTerms: [],
        searchKeyTermsToSoundex: [],
        searchKeyFormattedTerms: {
          formattedKeys: [],
          validFormattedKeys: [],
        },
      };

      searchService.generateMatchedInfo(1, 'Dora Chen', ['1600000001'], terms);
      expect(searchPersonController.generateMatchedInfo).toHaveBeenCalledWith(
        1,
        'Dora Chen',
        ['1600000001'],
        terms,
      );
    });
  });

  describe('generateFormattedTerms', () => {
    let searchPersonController: SearchPersonController;
    beforeEach(() => {
      clearMocks();
      setUp();
      searchPersonController = new SearchPersonController(searchService);
      Object.defineProperty(searchService, 'searchPersonController', {
        get: jest.fn(() => searchPersonController),
      });
    });
  });
});
