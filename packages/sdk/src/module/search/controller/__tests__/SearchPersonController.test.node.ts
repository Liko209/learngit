/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-17 00:12:46
 * Copyright © RingCentral. All rights reserved.
 */

import { SearchPersonController } from '../SearchPersonController';
import { ISearchService } from '../../service/ISearchService';

import { Person } from '../../../person/entity';
import { PersonService } from '../../../person';
import { buildEntityCacheSearchController } from 'sdk/framework/controller';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';
import { IEntityCacheSearchController } from 'sdk/framework/controller/interface/IEntityCacheSearchController';
import { SortableModel, IdModel } from 'sdk/framework/model';
import { AccountUserConfig } from '../../../account/config/AccountUserConfig';
import { GroupService } from '../../../group';
import { SearchUtils } from 'sdk/framework/utils/SearchUtils';
import { PersonEntityCacheController } from '../../../person/controller/PersonEntityCacheController';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { GroupConfigService } from '../../../groupConfig';
import { AccountService } from 'sdk/module/account';
import { PhoneContactEntity } from '../../entity';

jest.mock('sdk/module/config');
jest.mock('sdk/module/account/config');
jest.mock('sdk/api');
jest.mock('sdk/dao/DaoManager');
jest.mock('../../../group');
jest.mock('../../../groupConfig');

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
  let groupConfigService: GroupConfigService;
  function setUp() {
    groupConfigService = new GroupConfigService();
    groupService = new GroupService();
    personService = new PersonService();
    AccountUserConfig.prototype.getGlipUserId = jest.fn().mockReturnValue(1);

    entityCacheController = PersonEntityCacheController.buildPersonEntityCacheController(
      personService,
    );
    cacheSearchController = buildEntityCacheSearchController<Person>(
      entityCacheController,
    );

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
          case ServiceConfig.ACCOUNT_SERVICE:
            result = { userConfig: AccountUserConfig.prototype };
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
      const result = (await searchPersonController.doFuzzySearchPersons(
        'dora bruce',
        {
          excludeSelf: false,
        },
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('dora');
      expect(result.terms[1]).toBe('bruce');
    });

    it('search parts of data, with single term', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons(
        'dora',
        {
          excludeSelf: false,
        },
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('dora');
    });

    it('search parts of data, ignore case', async () => {
      let result = (await searchPersonController.doFuzzySearchPersons(
        'doRa,Bruce',
        {},
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('dora');
      expect(result.terms[1]).toBe('bruce');

      result = (await searchPersonController.doFuzzySearchPersons(
        'doXa',
        {},
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('doxa');

      result = (await searchPersonController.doFuzzySearchPersons(
        'doXa Bruce',
        {},
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(2);
    });

    it('search parts of data, email', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons(
        'cat',
        {},
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('cat');
    });

    it('search parts of data, email and name, not match', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons(
        'cat dog',
        {},
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('cat');
      expect(result.terms[1]).toBe('dog');
    });

    it('search parts of data, with arrangeIds', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons(
        'dora',
        {
          arrangeIds: [3, 1, 2, 10001, 10002],
        },
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(3);
      expect(result.sortableModels[0].displayName).toBe('dora1 bruce1');
      expect(result.sortableModels[1].displayName).toBe('dora2 bruce2');
      expect(result.sortableModels[2].displayName).toBe('dora3 bruce3');
    });

    it('search parts of data, exclude self', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons(
        'dora',
        {
          excludeSelf: true,
        },
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(9999);
    });

    it('search parts of data, searchKey is empty, return all if search key is empty', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons('', {
        fetchAllIfSearchKeyEmpty: true,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(20020);
    });

    it('search parts of data, searchKey is empty, can not return all if search key is empty', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons('', {
        fetchAllIfSearchKeyEmpty: false,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });

    it('search parts of data, searchKey not empty, can not return all if search key is empty', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons(
        'dora',
        {
          fetchAllIfSearchKeyEmpty: false,
        },
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(1);
    });

    it('search parts of data, searchKey is empty, excludeSelf, return all if search key is empty', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons('', {
        excludeSelf: true,
        fetchAllIfSearchKeyEmpty: true,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(20019);
    });

    it('search parts of data, searchKey is empty, excludeSelf, arrangeIds, return all if search key is empty', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons(
        undefined,
        {
          excludeSelf: true,
          arrangeIds: [3, 1, 2, 10001, 10002],
          fetchAllIfSearchKeyEmpty: true,
        },
      )) as SearchResultType;
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
      const result = (await searchPersonController.doFuzzySearchPersons(
        'dora',
        {
          excludeSelf: true,
          arrangeIds: [3, 1, 2, 10001, 10002],
          fetchAllIfSearchKeyEmpty: true,
        },
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(2);
      expect(result.terms.length).toBe(1);
      expect(result.sortableModels[0].id).toBe(2);
      expect(result.sortableModels[1].id).toBe(3);
    });

    it('search parts of data, searchKey is empty, excludeSelf, arrangeIds, can not return all if search key is empty', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons('', {
        excludeSelf: true,
        arrangeIds: [3, 1, 2, 10001, 10002],
        fetchAllIfSearchKeyEmpty: false,
      })) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });

    it('search persons, with email matched, name matched, check the priority', async () => {
      let result = (await searchPersonController.doFuzzySearchPersons(
        'monkey',
        {},
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(20);
      expect(result.sortableModels[0].id).toBe(20011);
      expect(result.sortableModels[9].id).toBe(20020);
      expect(result.sortableModels[10].id).toBe(20001);
      expect(result.sortableModels[19].id).toBe(20010);

      result = (await searchPersonController.doFuzzySearchPersons(
        'k w',
        {},
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(20);
      expect(result.sortableModels[0].id).toBe(20001);
      expect(result.sortableModels[9].id).toBe(20010);
      expect(result.sortableModels[10].id).toBe(20011);
      expect(result.sortableModels[19].id).toBe(20020);
    });

    it('search persons, with name matched, check if they are deactivated', async () => {
      let result = (await searchPersonController.doFuzzySearchPersons(
        'deactivatedByField',
        {},
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);

      result = (await searchPersonController.doFuzzySearchPersons(
        'deactivatedByFlags',
        {},
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
    });

    it('search persons, with name matched, check if they are isRemovedGuest ', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons(
        'isRemovedGuest',
        {},
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
    });

    it('search persons, with name matched, check if they are amRemovedGuest ', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons(
        'amRemovedGuest',
        {},
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
    });

    it('search persons, with name matched, check if they are unregistered', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons(
        'unRegistered',
        {},
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
    });

    it('search persons, with name matched, check if they are bogus', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons(
        'bogus',
        {},
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
    });

    it('search persons,  with name matched and first sort is same, recent searched will be on top of result', async () => {
      const time = Date.now();
      const records = new Map([
        [20012, { id: 20012, time_stamp: time }],
        [20013, { id: 20013, time_stamp: time - 1 }],
        [20014, { id: 20014, time_stamp: time - 2 }],
      ]);
      groupService.getIndividualGroups = jest.fn().mockReturnValue(new Map());
      searchService.getRecentSearchRecordsByType = jest
        .fn()
        .mockReturnValue(records);

      const result = (await searchPersonController.doFuzzySearchPersons(
        'monkey',
        {
          recentFirst: true,
        },
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(20);
      const firstFewResults = result.sortableModels.slice(0, 4);
      expect(firstFewResults.map(x => x.id)).toEqual([
        20012,
        20013,
        20014,
        20011,
      ]);
    });

    it('search persons,  with name matched, recent contacted will be on top of result', async () => {
      const time = Date.now();
      const groupConfigs = new Map([
        [20012, { id: 20012, my_last_post_time: time }],
        [20013, { id: 20013, my_last_post_time: time - 1 }],
        [20014, { id: 20014, my_last_post_time: time - 2 }],
      ]);
      const groups = new Map([
        [20012, { id: 20012 }],
        [20013, { id: 20013 }],
        [20014, { id: 20014 }],
      ]);
      groupService.getIndividualGroups = jest.fn().mockReturnValue(groups);
      searchService.getRecentSearchRecordsByType = jest
        .fn()
        .mockReturnValue(new Map());
      groupConfigService.getSynchronously = jest
        .fn()
        .mockImplementation((id: number) => {
          return groupConfigs.get(id);
        });
      const result = (await searchPersonController.doFuzzySearchPersons(
        'monkey',
        {
          recentFirst: true,
        },
      )) as SearchResultType;
      const firstFewResult = result.sortableModels.slice(0, 4);
      expect(firstFewResult.map(x => x.id)).toEqual([
        20012,
        20013,
        20014,
        20011,
      ]);
      expect(result.sortableModels.length).toBe(20);
    });

    it('search persons,  will order by recent searched and contacted both', async () => {
      const time = Date.now();
      const groupConfigs = new Map([
        [20016, { id: 20016, my_last_post_time: time }],
        [20011, { id: 20011, my_last_post_time: time - 1 }],
        [20012, { id: 20012, my_last_post_time: time - 2 }],
      ]);
      groupConfigService.getSynchronously = jest
        .fn()
        .mockImplementation((id: number) => {
          return groupConfigs.get(id);
        });

      const groups = new Map([
        [20016, { id: 20016 }],
        [20011, { id: 20011 }],
        [20012, { id: 20012 }],
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

      const result = (await searchPersonController.doFuzzySearchPersons(
        'monkey',
        {
          recentFirst: true,
        },
      )) as SearchResultType;
      const firstFewResult = result.sortableModels.slice(0, 6);

      expect(result.sortableModels.length).toBe(20);
      expect(firstFewResult.map(x => x.id)).toEqual([
        20014,
        20013,
        20016,
        20011,
        20012,
        20015,
      ]);
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
      const result = (await searchPersonController.doFuzzySearchPersons(
        'doaaaara bruce',
        {
          excludeSelf: false,
        },
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('doaaaara');
      expect(result.terms[1]).toBe('bruce');
    });

    it('search parts of data with soundex, with single terms', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons(
        'braaaauce',
        {
          excludeSelf: false,
        },
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('braaaauce');
    });

    it('search parts of data with soundex, with searchKey is empty', async () => {
      const result = (await searchPersonController.doFuzzySearchPersons(
        '',
        {},
      )) as SearchResultType;
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });
  });

  describe('duFuzzySearchPhoneContacts', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      personService['_entityCacheController'] = entityCacheController;
    });

    async function initTestData() {
      await entityCacheController.clear();
      for (let i = 1; i <= 10; i++) {
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
          first_name: `cat${i.toString()}`,
          last_name: `bruce${i.toString()}`,
          display_name: `cat${i.toString()} bruce${i.toString()}`,
          sanitized_rc_extension: {
            extensionNumber: `666${i}`,
            type: 'User',
          },
          rc_phone_numbers: [
            { id: i, phoneNumber: `65022700${i}`, usageType: 'DirectNumber' },
          ],
        };
        await entityCacheController.put(person as Person);
      }
    }

    it('should return all extension phone numbers when showExtensionOnly is true and is name matched and is co-worker when name matched [JPT-2568]', async () => {
      await initTestData();

      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      jest.spyOn(userConfig, 'getCurrentCompanyId').mockReturnValue(1);
      jest.spyOn(userConfig, 'getGlipUserId').mockReturnValue(Infinity);

      const result = await searchPersonController.doFuzzySearchPhoneContacts(
        'cat bruce',
        {
          excludeSelf: false,
          showExtensionOnly: true,
        },
      );

      expect(result!.terms.length).toBe(2);
      expect(result!.terms[0]).toBe('cat');
      expect(result!.terms[1]).toBe('bruce');
      expect(result!.phoneContacts.length).toBe(10);
    });

    it('should only return direct number when all are guests', async () => {
      await initTestData();

      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      jest.spyOn(userConfig, 'getCurrentCompanyId').mockReturnValue(2);

      const result = await searchPersonController.doFuzzySearchPhoneContacts(
        'cat bruce',
        {
          excludeSelf: false,
        },
      );
      expect(result!.terms.length).toBe(2);
      expect(result!.terms[0]).toBe('cat');
      expect(result!.terms[1]).toBe('bruce');
      expect(result!.phoneContacts.length).toBe(10);
    });

    it('should only return matched number when is name matched and phone number matched ', async () => {
      await initTestData();

      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      jest.spyOn(userConfig, 'getCurrentCompanyId').mockReturnValue(1);
      jest.spyOn(userConfig, 'getGlipUserId').mockReturnValue(Infinity);

      const result = await searchPersonController.doFuzzySearchPhoneContacts(
        'cat 666',
        {
          excludeSelf: false,
        },
      );

      expect(result!.terms.length).toBe(2);
      expect(result!.terms[0]).toBe('cat');
      expect(result!.terms[1]).toBe('666');
      expect(result!.phoneContacts.length).toBe(10);
      result!.phoneContacts.forEach((item: PhoneContactEntity) => {
        expect(item.phoneNumber.id.startsWith('666')).toBeTruthy();
      });

      const result2 = await searchPersonController.doFuzzySearchPhoneContacts(
        'cat 65022700',
        {
          excludeSelf: false,
        },
      );

      expect(result2!.terms.length).toBe(2);
      expect(result2!.terms[0]).toBe('cat');
      expect(result2!.terms[1]).toBe('65022700');
      expect(result2!.phoneContacts.length).toBe(10);
      result2!.phoneContacts.forEach((item: PhoneContactEntity) => {
        expect(item.phoneNumber.id.startsWith('65022700')).toBeTruthy();
      });
    });

    it('should only return matched number when is phone number matched ', async () => {
      await initTestData();

      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      jest.spyOn(userConfig, 'getCurrentCompanyId').mockReturnValue(1);
      jest.spyOn(userConfig, 'getGlipUserId').mockReturnValue(Infinity);
      const result = await searchPersonController.doFuzzySearchPhoneContacts(
        '650 22700',
        {
          excludeSelf: false,
        },
      );

      expect(result!.terms.length).toBe(2);
      expect(result!.terms[0]).toBe('650');
      expect(result!.terms[1]).toBe('22700');
      expect(result!.phoneContacts.length).toBe(10);
      result!.phoneContacts.forEach(item => {
        expect(item.phoneNumber.id.startsWith('65022700')).toBeTruthy();
      });
    });

    it('should not match email when search phone contact', async () => {
      await initTestData();

      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      jest.spyOn(userConfig, 'getCurrentCompanyId').mockReturnValue(1);
      jest.spyOn(userConfig, 'getGlipUserId').mockReturnValue(Infinity);
      const result = await searchPersonController.doFuzzySearchPhoneContacts(
        'ringcentral',
        {
          excludeSelf: false,
        },
      );

      expect(result).toEqual({ phoneContacts: [], terms: ['ringcentral'] });
    });
  });

  describe('duFuzzySearchPersonAndGroup', () => {
    it('should persons and groups with correct order when sort weights are same', async () => {
      const persons = [
        { id: 1, lowerCaseName: 'dora', sortWeights: [1] },
        { id: 2, lowerCaseName: 'bruce', sortWeights: [1] },
        { id: 3, lowerCaseName: 'me', sortWeights: [1] },
        { id: 4, lowerCaseName: 'benny', sortWeights: [1] },
      ];
      const groups = [
        {
          id: 13,
          entity: { id: 13, members: [3, 1, 2] },
          lowerCaseName: 'dora bruce',
          sortWeights: [1],
        },
        {
          id: 14,
          entity: { id: 14, members: [3, 2, 4] },
          lowerCaseName: 'bruce benny',
          sortWeights: [1],
        },
        {
          id: 15,
          entity: { id: 15, members: [3, 4] },
          lowerCaseName: 'benny',
          sortWeights: [1],
        },
      ];

      const expectedResult = [
        {
          id: 15,
          entity: { id: 15, members: [3, 4] },
          lowerCaseName: 'benny',
          sortWeights: [1],
        },
        { id: 2, lowerCaseName: 'bruce', sortWeights: [1] },
        {
          id: 14,
          entity: { id: 14, members: [3, 2, 4] },
          lowerCaseName: 'bruce benny',
          sortWeights: [1],
        },

        { id: 1, lowerCaseName: 'dora', sortWeights: [1] },

        {
          id: 13,
          entity: { id: 13, members: [3, 1, 2] },
          lowerCaseName: 'dora bruce',
          sortWeights: [1],
        },

        { id: 3, lowerCaseName: 'me', sortWeights: [1] },
      ];

      const value = {
        terms: 'x',
        sortableModels: persons,
      };
      searchPersonController.doFuzzySearchPersons = jest
        .fn()
        .mockReturnValue(value);

      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      jest.spyOn(userConfig, 'getGlipUserId').mockReturnValue(3);

      groupService.doFuzzySearchAllGroups = jest.fn().mockReturnValue({
        sortableModels: groups,
      });
      const result = await searchPersonController.doFuzzySearchPersonsAndGroups(
        'x',
        {},
        {},
      );
      expect(result).toEqual({
        terms: 'x',
        sortableModels: expectedResult,
      });

      expect(groupService.doFuzzySearchAllGroups).toHaveBeenCalled();
    });
    it('should persons and groups with correct order when sort weights are different', async () => {
      const persons = [
        { id: 1, lowerCaseName: 'dora', sortWeights: [2] },
        { id: 2, lowerCaseName: 'bruce', sortWeights: [1] },
        { id: 3, lowerCaseName: 'me', sortWeights: [2] },
        { id: 4, lowerCaseName: 'benny', sortWeights: [1] },
      ];
      const groups = [
        {
          id: 13,
          entity: { id: 13, members: [3, 1, 2] },
          lowerCaseName: 'dora bruce',
          sortWeights: [2],
        },
        {
          id: 14,
          entity: { id: 14, members: [3, 2, 4] },
          lowerCaseName: 'bruce benny',
          sortWeights: [1],
        },
        {
          id: 15,
          entity: { id: 15, members: [3, 4] },
          lowerCaseName: 'benny',
          sortWeights: [2],
        },
      ];

      const expectedResult = [
        {
          id: 15,
          entity: { id: 15, members: [3, 4] },
          lowerCaseName: 'benny',
          sortWeights: [2],
        },

        { id: 1, lowerCaseName: 'dora', sortWeights: [2] },

        {
          id: 13,
          entity: { id: 13, members: [3, 1, 2] },
          lowerCaseName: 'dora bruce',
          sortWeights: [2],
        },

        { id: 3, lowerCaseName: 'me', sortWeights: [2] },

        { id: 2, lowerCaseName: 'bruce', sortWeights: [1] },
        {
          id: 14,
          entity: { id: 14, members: [3, 2, 4] },
          lowerCaseName: 'bruce benny',
          sortWeights: [1],
        },
      ];

      const value = {
        terms: 'x',
        sortableModels: persons,
      };
      searchPersonController.doFuzzySearchPersons = jest
        .fn()
        .mockReturnValue(value);

      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      jest.spyOn(userConfig, 'getGlipUserId').mockReturnValue(3);

      groupService.doFuzzySearchAllGroups = jest.fn().mockReturnValue({
        sortableModels: groups,
      });
      const result = await searchPersonController.doFuzzySearchPersonsAndGroups(
        'x',
        {},
        {},
      );
      expect(result).toEqual({
        terms: 'x',
        sortableModels: expectedResult,
      });

      expect(groupService.doFuzzySearchAllGroups).toHaveBeenCalled();
    });

    it('should persons and groups with correct order when customize sortFunc', async () => {
      const persons = [
        { id: 1, lowerCaseName: 'dora', sortWeights: [2] },
        { id: 2, lowerCaseName: 'bruce', sortWeights: [1] },
        { id: 3, lowerCaseName: 'me', sortWeights: [2] },
        { id: 4, lowerCaseName: 'benny', sortWeights: [1] },
      ];
      const groups = [
        {
          id: 13,
          entity: { id: 13, members: [3, 1, 2] },
          lowerCaseName: 'dora bruce',
          sortWeights: [2],
        },
        {
          id: 14,
          entity: { id: 14, members: [3, 2, 4] },
          lowerCaseName: 'bruce benny',
          sortWeights: [1],
        },
        {
          id: 15,
          entity: { id: 15, members: [3, 4] },
          lowerCaseName: 'benny',
          sortWeights: [2],
        },
      ];

      const sortFunc = (
        lsh: SortableModel<IdModel>,
        rsh: SortableModel<IdModel>,
      ) => {
        return rsh.id - lsh.id;
      };

      const expectedResult = [
        {
          id: 15,
          entity: { id: 15, members: [3, 4] },
          lowerCaseName: 'benny',
          sortWeights: [2],
        },
        {
          id: 14,
          entity: { id: 14, members: [3, 2, 4] },
          lowerCaseName: 'bruce benny',
          sortWeights: [1],
        },
        {
          id: 13,
          entity: { id: 13, members: [3, 1, 2] },
          lowerCaseName: 'dora bruce',
          sortWeights: [2],
        },
        { id: 3, lowerCaseName: 'me', sortWeights: [2] },
        { id: 2, lowerCaseName: 'bruce', sortWeights: [1] },
        { id: 1, lowerCaseName: 'dora', sortWeights: [2] },
      ];

      const value = {
        terms: 'x',
        sortableModels: persons,
      };
      searchPersonController.doFuzzySearchPersons = jest
        .fn()
        .mockReturnValue(value);

      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      jest.spyOn(userConfig, 'getGlipUserId').mockReturnValue(3);

      groupService.doFuzzySearchAllGroups = jest.fn().mockReturnValue({
        sortableModels: groups,
      });
      const result = await searchPersonController.doFuzzySearchPersonsAndGroups(
        'x',
        {},
        {},
        sortFunc,
      );

      expect(result).toEqual({
        terms: 'x',
        sortableModels: expectedResult,
      });

      expect(groupService.doFuzzySearchAllGroups).toHaveBeenCalled();
    });

    it('should remove current user when me conversation matched', async () => {
      const persons = [
        { id: 1, lowerCaseName: 'dora', sortWeights: [2] },
        { id: 2, lowerCaseName: 'bruce', sortWeights: [1] },
        { id: 3, lowerCaseName: 'me', sortWeights: [2] },
        { id: 4, lowerCaseName: 'benny', sortWeights: [1] },
      ];
      const groups = [
        {
          id: 13,
          entity: { id: 13, members: [3, 1, 2] },
          lowerCaseName: 'dora bruce',
          sortWeights: [2],
        },
        {
          id: 14,
          entity: { id: 14, members: [3, 2, 4] },
          lowerCaseName: 'bruce benny',
          sortWeights: [1],
        },
        {
          id: 15,
          entity: { id: 15, members: [3, 4] },
          lowerCaseName: 'benny',
          sortWeights: [2],
        },
        {
          id: 16,
          entity: { id: 16, members: [3] },
          lowerCaseName: 'me',
          sortWeights: [2],
        },
      ];

      const sortFunc = (
        lsh: SortableModel<IdModel>,
        rsh: SortableModel<IdModel>,
      ) => {
        return rsh.id - lsh.id;
      };

      const expectedResult = [
        {
          id: 16,
          entity: { id: 16, members: [3] },
          lowerCaseName: 'me',
          sortWeights: [2],
        },
        {
          id: 15,
          entity: { id: 15, members: [3, 4] },
          lowerCaseName: 'benny',
          sortWeights: [2],
        },
        {
          id: 14,
          entity: { id: 14, members: [3, 2, 4] },
          lowerCaseName: 'bruce benny',
          sortWeights: [1],
        },
        {
          id: 13,
          entity: { id: 13, members: [3, 1, 2] },
          lowerCaseName: 'dora bruce',
          sortWeights: [2],
        },
       
        { id: 2, lowerCaseName: 'bruce', sortWeights: [1] },
        { id: 1, lowerCaseName: 'dora', sortWeights: [2] },
      ];

      const value = {
        terms: 'x',
        sortableModels: persons,
      };
      searchPersonController.doFuzzySearchPersons = jest
        .fn()
        .mockReturnValue(value);

      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      jest.spyOn(userConfig, 'getGlipUserId').mockReturnValue(3);

      groupService.doFuzzySearchAllGroups = jest.fn().mockReturnValue({
        sortableModels: groups,
      });
      const result = await searchPersonController.doFuzzySearchPersonsAndGroups(
        'x',
        {},
        {},
        sortFunc,
      );

      expect(result).toEqual({
        terms: 'x',
        sortableModels: expectedResult,
      });

      expect(groupService.doFuzzySearchAllGroups).toHaveBeenCalled();
    });
  });
});
