/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-17 00:12:46
 * Copyright © RingCentral. All rights reserved.
 */

import { SearchPersonController } from '../SearchPersonController';
import { ISearchService } from '../../service/ISearchService';

import { Person } from '../../../../module/person/entity';
import { PersonService } from '../../../../module/person';
import { buildEntityCacheSearchController } from '../../../../framework/controller';
import { IEntityCacheController } from '../../../../framework/controller/interface/IEntityCacheController';
import { IEntityCacheSearchController } from '../../../../framework/controller/interface/IEntityCacheSearchController';
import { SortableModel } from '../../../../framework/model';
import { AccountUserConfig } from '../../../../module/account/config';
import { GroupService } from '../../../group';
import { SearchUtils } from '../../../../framework/utils/SearchUtils';
import { PersonEntityCacheController } from '../../../person/controller/PersonEntityCacheController';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';

jest.mock('../../../../module/account/config');
jest.mock('../../../../api');
jest.mock('../../../../dao/DaoManager');
jest.mock('../../../group');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SearchPersonController', () => {
  let searchPersonController: SearchPersonController;
  let searchService: ISearchService;

  let personService: PersonService;
  let entityCacheController: IEntityCacheController<Person>;
  let cacheSearchController: IEntityCacheSearchController<Person>;
  let groupService: GroupService;
  function setUp() {
    groupService = new GroupService();

    AccountUserConfig.prototype.getGlipUserId = jest.fn().mockReturnValue(1);

    entityCacheController = PersonEntityCacheController.buildPersonEntityCacheController(
      personService,
    );
    cacheSearchController = buildEntityCacheSearchController<Person>(
      entityCacheController,
    );

    personService = new PersonService();
    jest
      .spyOn(personService, 'getEntityCacheSearchController')
      .mockReturnValue(cacheSearchController);

    searchService = jest.fn().mockReturnValue({
      getRecentSearchRecordsMap: jest.fn(),
    }) as any;
    searchService.getRecentSearchRecordsByType = jest.fn();
    searchPersonController = new SearchPersonController(searchService);

    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((serviceName: string) => {
        let result: any = null;
        switch (serviceName) {
          case ServiceConfig.PERSON_SERVICE:
            result = personService;
            break;
          case ServiceConfig.GROUP_SERVICE:
            result = groupService;
            break;
          case ServiceConfig.ITEM_SERVICE:
            result = itemService;
            break;
          case ServiceConfig.ACCOUNT_SERVICE:
            result = accountService;
            break;
          case ServiceConfig.GLOBAL_CONFIG_SERVICE:
            result = {
              get: jest.fn(),
              put: jest.fn(),
              clear: jest.fn(),
            };
            break;
          case ServiceConfig.GROUP_CONFIG_SERVICE:
            result = groupConfigService;
            break;
          default:
            break;
        }
        return result;
      });
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });
  async function prepareDataForSearchUTs() {
    await entityCacheController.clear();
    for (let i = 1; i <= 10000; i += 1) {
      const person = {
        id: i,
        created_at: i,
        modified_at: i,
        creator_id: i,
        is_new: false,
        has_registered: true,
        version: i,
        company_id: 1,
        email: `cat${i.toString()}@ringcentral.com`,
        me_group_id: 1,
        first_name: `dora${i.toString()}`,
        last_name: `bruce${i.toString()}`,
        display_name: `dora${i.toString()} bruce${i.toString()}`,
      };
      await entityCacheController.put(person as Person);
    }

    for (let i = 10001; i <= 20000; i += 1) {
      const person = {
        id: i,
        created_at: i,
        modified_at: i,
        creator_id: i,
        is_new: false,
        flags: 4,
        version: i,
        company_id: 1,
        email: `dog${i.toString()}@ringcentral.com`,
        me_group_id: 1,
        first_name: `ben${i.toString()}`,
        last_name: `niu${i.toString()}`,
        display_name: `ben${i.toString()} niu${i.toString()}`,
      };
      entityCacheController.put(person as Person);
    }

    for (let i = 20001; i <= 20010; i += 1) {
      const person = {
        id: i,
        created_at: i,
        modified_at: i,
        creator_id: i,
        is_new: false,
        deactivated: false,
        has_registered: true,
        version: i,
        company_id: 1,
        email: `monkey${i.toString()}@ringcentral.com`,
        me_group_id: 1,
        first_name: `kong${i.toString()}`,
        last_name: `wu${i.toString()}`,
        display_name: `kong${i.toString()} wu${i.toString()}`,
      };
      entityCacheController.put(person);
    }

    for (let i = 20011; i <= 20020; i += 1) {
      const person = {
        id: i,
        created_at: i,
        modified_at: i,
        creator_id: i,
        is_new: false,
        deactivated: false,
        flags: 4,
        version: i,
        company_id: 1,
        email: `master${i.toString()}@ringcentral.com`,
        me_group_id: 1,
        first_name: `monkey${i.toString()}`,
        last_name: `wu${i.toString()}`,
        display_name: `monkey${i.toString()} wu${i.toString()}`,
      };
      entityCacheController.put(person as Person);
    }

    const deactivatedByField = {
      id: 20021,
      created_at: 20021,
      modified_at: 20021,
      creator_id: 20021,
      is_new: false,
      deactivated: true,
      version: 20021,
      company_id: 1,
      email: 'master20021@ringcentral.com',
      me_group_id: 1,
      first_name: 'deactivatedByField',
      last_name: 'deactivatedByField',
      display_name: 'deactivatedByField',
    };
    entityCacheController.put(deactivatedByField);

    const deactivatedByFlags = {
      id: 20022,
      created_at: 20022,
      modified_at: 20022,
      creator_id: 20022,
      is_new: false,
      flags: 2,
      version: 20022,
      company_id: 1,
      email: 'master20022@ringcentral.com',
      me_group_id: 1,
      first_name: 'deactivatedByFlags',
      last_name: 'deactivatedByFlags',
      display_name: 'deactivatedByFlags',
    };
    entityCacheController.put(deactivatedByFlags as Person);

    const isRemovedGuest = {
      id: 20023,
      created_at: 20023,
      modified_at: 20023,
      creator_id: 20023,
      is_new: false,
      has_registered: true,
      flags: 1024,
      version: 20023,
      company_id: 1,
      email: 'master20023@ringcentral.com',
      me_group_id: 1,
      first_name: 'isRemovedGuest',
      last_name: 'isRemovedGuest',
      display_name: 'isRemovedGuest',
    };
    entityCacheController.put(isRemovedGuest as Person);

    const amRemovedGuest = {
      id: 20024,
      created_at: 20024,
      modified_at: 20024,
      creator_id: 20024,
      is_new: false,
      flags: 2052,
      version: 20024,
      company_id: 1,
      email: 'master20024@ringcentral.com',
      me_group_id: 1,
      first_name: 'amRemovedGuest',
      last_name: 'amRemovedGuest',
      display_name: 'amRemovedGuest',
    };
    entityCacheController.put(amRemovedGuest as Person);

    const unRegistered1 = {
      id: 20025,
      created_at: 20025,
      modified_at: 20025,
      creator_id: 20025,
      is_new: false,
      flags: 0,
      version: 20025,
      company_id: 1,
      email: 'master20025@ringcentral.com',
      me_group_id: 1,
      first_name: 'unRegistered',
      last_name: 'unRegistered',
      display_name: 'unRegistered',
    };
    entityCacheController.put(unRegistered1 as Person);

    const bogusUser = {
      id: 20026,
      created_at: 20026,
      modified_at: 20026,
      creator_id: 20026,
      is_new: false,
      flags: 4620,
      version: 20026,
      company_id: 1,
      email: 'bogus@ringcentral.com',
      me_group_id: 1,
      first_name: 'bogus',
      last_name: 'bogus',
      display_name: 'bogus',
    };
    entityCacheController.put(bogusUser as Person);
  }
  type SearchResultType = {
    terms: string[];
    sortableModels: SortableModel<Person>[];
  };
  describe('doFuzzySearchPersons', () => {
    beforeEach(async () => {
      clearMocks();
      setUp();
      await prepareDataForSearchUTs();
      SearchUtils.isUseSoundex = jest.fn().mockReturnValue(false);
    });

    it('search parts of data, with multi terms', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'dora bruce',
        excludeSelf: false,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('dora');
      expect(result.terms[1]).toBe('bruce');
    });

    it('search parts of data, with single term', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'dora',
        excludeSelf: false,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('dora');
    });

    it('search parts of data, ignore case', async () => {
      let result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'doRa,Bruce',
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('dora');
      expect(result.terms[1]).toBe('bruce');

      result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'doXa',
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('doxa');

      result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'doXa Bruce',
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(2);
    });

    it('search parts of data, email', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'cat',
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('cat');
    });

    it('search parts of data, email and name, not match', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'cat dog',
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('cat');
      expect(result.terms[1]).toBe('dog');
    });

    it('search parts of data, with arrangeIds', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'dora',
        arrangeIds: [3, 1, 2, 10001, 10002],
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(3);
      expect(result.sortableModels[0].displayName).toBe('dora1 bruce1');
      expect(result.sortableModels[1].displayName).toBe('dora2 bruce2');
      expect(result.sortableModels[2].displayName).toBe('dora3 bruce3');
    });

    it('search parts of data, exclude self', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'dora',
        excludeSelf: true,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(9999);
    });

    it('search parts of data, searchKey is empty, return all if search key is empty', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: '',
        fetchAllIfSearchKeyEmpty: true,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(20020);
    });

    it('search parts of data, searchKey is empty, can not return all if search key is empty', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: '',
        fetchAllIfSearchKeyEmpty: false,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });

    it('search parts of data, searchKey not empty, can not return all if search key is empty', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'dora',
        fetchAllIfSearchKeyEmpty: false,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(1);
    });

    it('search parts of data, searchKey is empty, excludeSelf, return all if search key is empty', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: '',
        excludeSelf: true,
        fetchAllIfSearchKeyEmpty: true,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(20019);
    });

    it('search parts of data, searchKey is empty, excludeSelf, arrangeIds, return all if search key is empty', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: undefined,
        excludeSelf: true,
        arrangeIds: [3, 1, 2, 10001, 10002],
        fetchAllIfSearchKeyEmpty: true,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(4);
      expect(result.terms.length).toBe(0);
      expect(result.sortableModels[0].id).toBe(10001);
      expect(result.sortableModels[1].id).toBe(10002);
      expect(result.sortableModels[2].id).toBe(2);
      expect(result.sortableModels[3].id).toBe(3);
    });

    //   searchKey?: string;
    // excludeSelf?: boolean;
    // arrangeIds?: number[];
    // fetchAllIfSearchKeyEmpty?: boolean;
    // asIdsOrder?: boolean;
    // recentFirst?: boolean;
    it('search parts of data, searchKey not empty, excludeSelf, arrangeIds, return all if search key is empty', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'dora',
        excludeSelf: true,
        arrangeIds: [3, 1, 2, 10001, 10002],
        fetchAllIfSearchKeyEmpty: true,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(2);
      expect(result.terms.length).toBe(1);
      expect(result.sortableModels[0].id).toBe(2);
      expect(result.sortableModels[1].id).toBe(3);
    });

    it('search parts of data, searchKey is empty, excludeSelf, arrangeIds, can not return all if search key is empty', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: '',
        excludeSelf: true,
        arrangeIds: [3, 1, 2, 10001, 10002],
        fetchAllIfSearchKeyEmpty: false,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });

    it('search persons, with email matched, name matched, check the priority', async () => {
      let result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'monkey',
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(20);
      expect(result.sortableModels[0].id).toBe(20011);
      expect(result.sortableModels[9].id).toBe(20020);
      expect(result.sortableModels[10].id).toBe(20001);
      expect(result.sortableModels[19].id).toBe(20010);

      result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'k w',
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(20);
      expect(result.sortableModels[0].id).toBe(20001);
      expect(result.sortableModels[9].id).toBe(20010);
      expect(result.sortableModels[10].id).toBe(20011);
      expect(result.sortableModels[19].id).toBe(20020);
    });

    it('search persons, with name matched, check if they are deactivated', async () => {
      let result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'deactivatedByField',
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);

      result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'deactivatedByFlags',
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
    });

    it('search persons, with name matched, check if they are isRemovedGuest ', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'isRemovedGuest',
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
    });

    it('search persons, with name matched, check if they are amRemovedGuest ', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'amRemovedGuest',
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
    });

    it('search persons, with name matched, check if they are unregistered', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'unRegistered',
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
    });

    it('search persons, with name matched, check if they are bogus', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'bogus',
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
    });

    it('search persons,  with name matched, recent searched will be on top of result', async () => {
      const time = Date.now();
      const records = new Map([
        [20002, { id: 20002, time_stamp: time }],
        [20003, { id: 20003, time_stamp: time - 1 }],
        [20005, { id: 20005, time_stamp: time - 2 }],
      ]);
      searchService.getRecentSearchRecordsByType = jest
        .fn()
        .mockReturnValue(records);

      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'monkey',
        recentFirst: true,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(20);
      expect(result.sortableModels[0].id).toBe(20002);
      expect(result.sortableModels[1].id).toBe(20003);
      expect(result.sortableModels[2].id).toBe(20005);
      expect(result.sortableModels[3].id).toBe(20011);
    });

    it('search persons,  with name matched, recent contacted will be on top of result', async () => {
      const time = Date.now();
      const groups = new Map([
        [20002, { id: 20002, most_recent_post_created_at: time }],
        [20003, { id: 20003, most_recent_post_created_at: time - 1 }],
        [20005, { id: 20005, most_recent_post_created_at: time - 2 }],
      ]);
      groupService.getIndividualGroups = jest.fn().mockReturnValue(groups);

      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'monkey',
        recentFirst: true,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(20);
      expect(result.sortableModels[0].id).toBe(20002);
      expect(result.sortableModels[1].id).toBe(20003);
      expect(result.sortableModels[2].id).toBe(20005);
      expect(result.sortableModels[3].id).toBe(20011);
    });

    it('search persons,  will order by recent searched and contacted both', async () => {
      const time = Date.now();
      const groups = new Map([
        [20002, { id: 20002, most_recent_post_created_at: time }],
        [20003, { id: 20003, most_recent_post_created_at: time - 1 }],
        [20005, { id: 20005, most_recent_post_created_at: time - 2 }],
      ]);
      groupService.getIndividualGroups = jest.fn().mockReturnValue(groups);

      const records = new Map([
        [20013, { id: 20013, time_stamp: time + 1 }],
        [20014, { id: 20014, time_stamp: time + 2 }],
        [20015, { id: 20015, time_stamp: time - 3 }],
      ]);
      searchService.getRecentSearchRecordsByType = jest
        .fn()
        .mockReturnValue(records);

      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'monkey',
        recentFirst: true,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(20);
      expect(result.sortableModels[0].id).toBe(20014);
      expect(result.sortableModels[1].id).toBe(20013);
      expect(result.sortableModels[2].id).toBe(20002);
      expect(result.sortableModels[3].id).toBe(20003);
      expect(result.sortableModels[4].id).toBe(20005);
      expect(result.sortableModels[5].id).toBe(20015);
      expect(result.sortableModels[6].id).toBe(20011);
    });
  });

  describe('duFuzzySearchPerson with soundex', () => {
    beforeEach(async () => {
      clearMocks();
      setUp();
      personService['_entityCacheController'] = entityCacheController;
      await prepareDataForSearchUTs();
      SearchUtils.isUseSoundex = jest.fn().mockReturnValue(true);
    });

    it('search parts of data with soundex, with multi terms', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'doaaaara bruce',
        excludeSelf: false,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('doaaaara');
      expect(result.terms[1]).toBe('bruce');
    });

    it('search parts of data with soundex, with single terms', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: 'braaaauce',
        excludeSelf: false,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('braaaauce');
    });

    it('search parts of data with soundex, with searchKey is empty', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons({
        searchKey: '',
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });
  });
});
