/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-23 13:23:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PersonController } from '../PersonController';
import { daoManager, AuthDao } from '../../../../dao';
import { PersonDao } from '../../dao';
import { Person, PHONE_NUMBER_TYPE } from '../../entity';
import { personFactory } from '../../../../__tests__/factories';
import { KVStorageManager } from 'foundation';
import PersonAPI from '../../../../api/glip/person';

import {
  buildEntitySourceController,
  buildEntityCacheSearchController,
  buildEntityCacheController,
  buildEntityPersistentController,
} from '../../../../framework/controller';
import { IEntityPersistentController } from '../../../../framework/controller/interface/IEntityPersistentController';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { IEntityCacheController } from '../../../../framework/controller/interface/IEntityCacheController';
import { IEntityCacheSearchController } from '../../../../framework/controller/interface/IEntityCacheSearchController';
import { FEATURE_TYPE, FEATURE_STATUS } from '../../../group/entity';
import { GlobalConfigService } from '../../../../module/config';
import { AccountGlobalConfig } from '../../../../service/account/config';
import { ContactType } from '../../types';

jest.mock('../../../../module/config');
jest.mock('../../../../service/account/config');
GlobalConfigService.getInstance = jest.fn();

jest.mock('../../../../module/group');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../../../dao/DaoManager');

describe('PersonService', () => {
  let personController: PersonController;
  let personDao: PersonDao;

  let entityPersistentController: IEntityPersistentController<Person>;
  let entitySourceController: IEntitySourceController<Person>;
  let entityCacheController: IEntityCacheController<Person>;
  let cacheSearchController: IEntityCacheSearchController<Person>;

  function setUp() {
    personController = new PersonController();
    personDao = new PersonDao(null);

    entityCacheController = buildEntityCacheController<Person>();
    entityPersistentController = buildEntityPersistentController<Person>(
      personDao,
      entityCacheController,
    );
    entitySourceController = buildEntitySourceController<Person>(
      entityPersistentController,
    );
    cacheSearchController = buildEntityCacheSearchController<Person>(
      entityCacheController,
    );

    personController.setDependentController(
      entitySourceController,
      cacheSearchController,
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    setUp();
  });

  describe('getPersonsByIds()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      setUp();
    });

    const person1: Person = {
      id: 1,
      created_at: 1,
      modified_at: 1,
      creator_id: 1,
      is_new: false,
      has_registered: true,
      version: 1,
      company_id: 1,
      email: 'cat1@ringcentral.com',
      me_group_id: 1,
      first_name: 'dora1',
      last_name: 'bruce1',
      display_name: 'dora1 bruce1',
    };

    const person2: Person = {
      id: 2,
      created_at: 2,
      modified_at: 2,
      creator_id: 2,
      is_new: false,
      has_registered: true,
      version: 2,
      company_id: 1,
      email: 'cat2@ringcentral.com',
      me_group_id: 2,
      first_name: 'dora2',
      last_name: 'bruce2',
      display_name: 'dora2 bruce2',
    };

    it('should return all matched person', async () => {
      entitySourceController.batchGet = jest.fn();
      entitySourceController.batchGet.mockImplementation(() => {
        return [person1, person2];
      });
      const result = await personController.getPersonsByIds([1, 2]);
      expect(entitySourceController.batchGet).toBeCalledWith([1, 2]);
      expect(result).toEqual([person1, person2]);
    });

    it('should return [] when no id was given', async () => {
      const result = await personController.getPersonsByIds([]);
      expect(result).toEqual([]);
    });
  });

  describe('getAllCount()', () => {
    it('should return all matched person length', async () => {
      const mock = 3;
      daoManager.getDao.mockReturnValue(personDao);
      personDao.getAllCount = jest.fn();
      personDao.getAllCount.mockReturnValue(mock);
      const result = await personController.getAllCount();
      expect(result).toBe(mock);
    });
  });

  describe('doFuzzySearchPersons', async () => {
    async function prepareDataForSearchUTs() {
      await entityCacheController.clear();
      for (let i = 1; i <= 10000; i += 1) {
        const person: Person = {
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
        await entityCacheController.put(person);
      }

      for (let i = 10001; i <= 20000; i += 1) {
        const person: Person = {
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
        entityCacheController.put(person);
      }

      for (let i = 20001; i <= 20010; i += 1) {
        const person: Person = {
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
        const person: Person = {
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
        entityCacheController.put(person);
      }

      const deactivatedByField: Person = {
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

      const deactivatedByFlags: Person = {
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
      entityCacheController.put(deactivatedByFlags);

      const isRemovedGuest: Person = {
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
      entityCacheController.put(isRemovedGuest);

      const amRemovedGuest: Person = {
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
      entityCacheController.put(amRemovedGuest);
    }

    beforeEach(async () => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      setUp();
      AccountGlobalConfig.getCurrentUserId = jest.fn().mockReturnValue(1);
      await prepareDataForSearchUTs();
    });

    it('search parts of data, with multi terms', async () => {
      const result = await personController.doFuzzySearchPersons(
        'dora bruce',
        false,
      );
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('dora');
      expect(result.terms[1]).toBe('bruce');
    });

    it('search parts of data, with single term', async () => {
      const result = await personController.doFuzzySearchPersons('dora', false);
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('dora');
    });

    it('search parts of data, ignore case', async () => {
      let result = await personController.doFuzzySearchPersons(
        'doRa,Bruce',
        false,
      );
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('doRa');
      expect(result.terms[1]).toBe('Bruce');

      result = await personController.doFuzzySearchPersons('doXa', false);
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('doXa');

      result = await personController.doFuzzySearchPersons('doXa Bruce', false);
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(2);
    });

    it('search parts of data, email', async () => {
      const result = await personController.doFuzzySearchPersons('cat', false);
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('cat');
    });

    it('search parts of data, email and name, not match', async () => {
      const result = await personController.doFuzzySearchPersons(
        'cat dog',
        false,
      );
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('cat');
      expect(result.terms[1]).toBe('dog');
    });
    it('search parts of data, with arrangeIds', async () => {
      const result = await personController.doFuzzySearchPersons(
        'dora',
        false,
        [3, 1, 2, 10001, 10002],
      );
      expect(result.sortableModels.length).toBe(3);
      expect(result.sortableModels[0].displayName).toBe('dora1 bruce1');
      expect(result.sortableModels[1].displayName).toBe('dora2 bruce2');
      expect(result.sortableModels[2].displayName).toBe('dora3 bruce3');
    });

    it('search parts of data, exclude self', async () => {
      const result = await personController.doFuzzySearchPersons('dora', true);
      expect(result.sortableModels.length).toBe(9999);
    });

    it('search parts of data, searchKey is empty, return all if search key is empty', async () => {
      const result = await personController.doFuzzySearchPersons(
        '',
        undefined,
        undefined,
        true,
      );
      expect(result.sortableModels.length).toBe(20020);
    });

    it('search parts of data, searchKey is empty, can not return all if search key is empty', async () => {
      const result = await personController.doFuzzySearchPersons(
        '',
        undefined,
        undefined,
        false,
      );
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });

    it('search parts of data, searchKey not empty, can not return all if search key is empty', async () => {
      const result = await personController.doFuzzySearchPersons(
        'dora',
        undefined,
        undefined,
        false,
      );
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(1);
    });

    it('search parts of data, searchKey is empty, excludeSelf, return all if search key is empty', async () => {
      const result = await personController.doFuzzySearchPersons(
        '',
        true,
        undefined,
        true,
      );
      expect(result.sortableModels.length).toBe(20019);
    });

    it('search parts of data, searchKey is empty, excludeSelf, arrangeIds, return all if search key is empty', async () => {
      const result = await personController.doFuzzySearchPersons(
        undefined,
        true,
        [3, 1, 2, 10001, 10002],
        true,
      );
      expect(result.sortableModels.length).toBe(4);
      expect(result.terms.length).toBe(0);
      expect(result.sortableModels[0].id).toBe(10001);
      expect(result.sortableModels[1].id).toBe(10002);
      expect(result.sortableModels[2].id).toBe(2);
      expect(result.sortableModels[3].id).toBe(3);
    });

    it('search parts of data, searchKey not empty, excludeSelf, arrangeIds, return all if search key is empty', async () => {
      const result = await personController.doFuzzySearchPersons(
        'dora',
        true,
        [3, 1, 2, 10001, 10002],
        true,
      );
      expect(result.sortableModels.length).toBe(2);
      expect(result.terms.length).toBe(1);
      expect(result.sortableModels[0].id).toBe(2);
      expect(result.sortableModels[1].id).toBe(3);
    });

    it('search parts of data, searchKey is empty, excludeSelf, arrangeIds, can not return all if search key is empty', async () => {
      const result = await personController.doFuzzySearchPersons(
        '',
        true,
        [3, 1, 2, 10001, 10002],
        false,
      );
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });

    it('search persons, with email matched, name matched, check the priority', async () => {
      let result = await personController.doFuzzySearchPersons('monkey');
      expect(result.sortableModels.length).toBe(20);
      expect(result.sortableModels[0].id).toBe(20011);
      expect(result.sortableModels[9].id).toBe(20020);
      expect(result.sortableModels[10].id).toBe(20001);
      expect(result.sortableModels[19].id).toBe(20010);

      result = await personController.doFuzzySearchPersons('k w');
      expect(result.sortableModels.length).toBe(20);
      expect(result.sortableModels[0].id).toBe(20001);
      expect(result.sortableModels[9].id).toBe(20010);
      expect(result.sortableModels[10].id).toBe(20011);
      expect(result.sortableModels[19].id).toBe(20020);
    });

    it('search persons, with name matched, check if they are deactivated', async () => {
      let result = await personController.doFuzzySearchPersons(
        'deactivatedByField',
      );
      expect(result.sortableModels.length).toBe(0);

      result = await personController.doFuzzySearchPersons(
        'deactivatedByFlags',
      );
      expect(result.sortableModels.length).toBe(0);
    });

    it('search persons, with name matched, check if they are isRemovedGuest ', async () => {
      const result = await personController.doFuzzySearchPersons(
        'isRemovedGuest',
      );
      expect(result.sortableModels.length).toBe(0);
    });

    it('search persons, with name matched, check if they are amRemovedGuest ', async () => {
      const result = await personController.doFuzzySearchPersons(
        'amRemovedGuest',
      );
      expect(result.sortableModels.length).toBe(0);
    });
  });

  describe('buildPersonFeatureMap()', () => {
    const personId = 1;
    const person = { id: personId };
    it('should not have conference permission for person', async () => {
      const spy = jest.spyOn(entitySourceController, 'get');
      spy.mockResolvedValueOnce(person);
      const res = await personController.buildPersonFeatureMap(personId);
      expect(res.get(FEATURE_TYPE.CONFERENCE)).toBeFalsy;
      expect(spy).toBeCalled;
    });

    it('should have message for person', async () => {
      const spy = jest.spyOn(entitySourceController, 'get');
      spy.mockResolvedValueOnce(person);
      const res = await personController.buildPersonFeatureMap(personId);
      expect(res.get(FEATURE_TYPE.MESSAGE)).toBe(FEATURE_STATUS.ENABLE);
      expect(spy).toBeCalledWith(person.id);
    });

    it('should not have message for pseudo person', async () => {
      const pseudoPerson = { id: personId, is_pseudo_user: true };
      const spy = jest.spyOn(entitySourceController, 'get');
      spy.mockResolvedValueOnce(pseudoPerson);
      const res = await personController.buildPersonFeatureMap(personId);
      expect(res.get(FEATURE_TYPE.MESSAGE)).toBe(FEATURE_STATUS.INVISIBLE);
      expect(spy).toBeCalledWith(pseudoPerson.id);
    });
  });

  describe('getAvailablePhoneNumbers()', () => {
    const rcPhoneNumbers = [
      { id: 11, phoneNumber: '1', usageType: 'MainCompanyNumber' },
      { id: 11, phoneNumber: '2', usageType: 'CompanyNumber' },
      { id: 11, phoneNumber: '3', usageType: 'AdditionalCompanyNumber' },
      { id: 11, phoneNumber: '4', usageType: 'ForwardedNumber' },
      { id: 11, phoneNumber: '5', usageType: 'MainCompanyNumber' },
      { id: 12, phoneNumber: '234567', usageType: 'DirectNumber' },
    ];
    const sanitizedRcExtension = { extensionNumber: '4711', type: 'User' };
    const ext = {
      type: PHONE_NUMBER_TYPE.EXTENSION_NUMBER,
      phoneNumber: '4711',
    };
    const did = {
      type: PHONE_NUMBER_TYPE.DIRECT_NUMBER,
      phoneNumber: '234567',
    };

    beforeEach(() => {
      AccountGlobalConfig.getCurrentCompanyId = jest.fn().mockReturnValue(1);
    });

    it('should not return extension id for guest user', () => {
      expect(
        personController.getAvailablePhoneNumbers(
          123,
          rcPhoneNumbers,
          sanitizedRcExtension,
        ),
      ).toEqual([did]);
    });

    it.each([
      [rcPhoneNumbers, sanitizedRcExtension, [ext, did]],
      [rcPhoneNumbers, undefined, [did]],
      [undefined, sanitizedRcExtension, [ext]],
    ])(
      'should return all available phone numbers, case index: %#',
      (rcPhones, rcExt, expectRes) => {
        expect(
          personController.getAvailablePhoneNumbers(1, rcPhones, rcExt),
        ).toEqual(expectRes);
      },
    );
  });
  describe('getEmailAsName()', () => {
    it('should return name when email validate', () => {
      const firstName = 'Bruce';
      const lastName = 'Chen';
      const person = personFactory.build({
        email: `${firstName}.${lastName}@ringcentral.com`,
      });
      const result = personController.getEmailAsName(person);
      expect(result).toEqual(`${firstName} ${lastName}`);
    });
    it('should return empty string while no email info', () => {
      const person = personFactory.build({
        email: null,
      });
      const result = personController.getEmailAsName(person);
      expect(result).toEqual('');
    });
    it("should convert name's first letter to UpperCase", () => {
      const firstName = 'bruce';
      const lastName = 'chen';
      const person = personFactory.build({
        email: `${firstName}.${lastName}@ringcentral.com`,
      });
      const result = personController.getEmailAsName(person);
      expect(result).toEqual('Bruce Chen');
    });
  });
  describe('getFullName()', () => {
    it('should return displayName first', () => {
      const displayName = 'Bruce Chen';
      const firstName = 'Niki';
      const lastName = 'Rao';
      const email = 'Dog.Mao@ringcentral.com';
      expect(
        personController.getFullName(
          personFactory.build({
            email,
            display_name: displayName,
            first_name: firstName,
            last_name: lastName,
          }),
        ),
      ).toEqual(displayName);
    });
    it('should return LastName FirstName after displayName', () => {
      const firstName = 'Bruce';
      const lastName = 'Chen';
      const email = 'Dog.Mao@ringcentral.com';
      expect(
        personController.getFullName(
          personFactory.build({
            email,
            display_name: '',
            first_name: firstName,
            last_name: lastName,
          }),
        ),
      ).toEqual(`${firstName} ${lastName}`);
    });
    it('should return name of email after displayName and FirstName LastName', () => {
      const email = 'Bruce.Chen@ringcentral.com';
      expect(
        personController.getFullName(
          personFactory.build({ email, first_name: '', last_name: '' }),
        ),
      ).toEqual('Bruce Chen');
    });
  });

  describe('getHeadShotWithSize()', () => {
    const URL = 'https://glip.com/test.jpg';
    const thumbsSize64 = 'https://glip.com/thumbs64.jpg';
    const thumbsSize92 = 'https://glip.com/thumbs92.jpg';
    const thumbsSize150 = 'https://glip.com/thumbs150.jpg';
    const thumbsSizeX = 'https://glip.com/thumbsx.jpg';
    const kvStorageManager = new KVStorageManager();
    const kvStorage = kvStorageManager.getStorage();
    const authDao = new AuthDao(kvStorage);

    beforeEach(() => {});
    it('should return headShotUrl', () => {
      daoManager.getKVDao.mockReturnValueOnce(authDao);
      authDao.get = jest.fn();
      authDao.get.mockReturnValueOnce('token');
      const headUrl = 'mockUrl';
      const spy = jest
        .spyOn(PersonAPI, 'getHeadShotUrl')
        .mockReturnValueOnce(headUrl);
      const result = personController.getHeadShotWithSize(1, 'xxx', '', 33);
      expect(result).toEqual(headUrl);
    });

    it('should return empty string when headShotVersion is empty', () => {
      daoManager.getKVDao.mockReturnValueOnce(authDao);
      authDao.get.mockReturnValueOnce('token');
      const headUrl = 'mockUrl';
      const spy = jest
        .spyOn(PersonAPI, 'getHeadShotUrl')
        .mockReturnValueOnce(headUrl);
      const result = personController.getHeadShotWithSize(1, null, '', 33);
      expect(result).toBeNull;
    });

    it('should url when the headshot is string', () => {
      const headshot = URL;
      const url = personController.getHeadShotWithSize(1, '', headshot, 150);
      expect(url).toBe(URL);
    });

    it('should return url when there is no thumbs', () => {
      const headshot = {
        url: URL,
      };
      const url = personController.getHeadShotWithSize(1, '', headshot, 150);
      expect(url).toBe(URL);
    });

    it('should return url when thumbs is invalid', () => {
      const thumbsString = { 'height-13942071308size=16x16': 16 };
      const headshot = {
        thumbs: thumbsString,
        url: URL,
      };
      const url = personController.getHeadShotWithSize(1, '', headshot, 150);
      expect(url).toBe(URL);
    });

    it('should return first key as url', () => {
      const thumbsString = { '123size=100x100': thumbsSizeX };
      const headshot = {
        thumbs: thumbsString,
        url: URL,
      };
      const url = personController.getHeadShotWithSize(1, '', headshot, 150);
      expect(url).toBe(thumbsSizeX);
    });

    it('should return the highest size of thumbs without stored_file_id', () => {
      const thumbsString = {
        'height-13942071308size=16x16': 16,
        'width-13942071308size=24x24': 24,
        '123size=100x100': thumbsSizeX,
        '123size=64': thumbsSize64,
        '123size=92': thumbsSize92,
        '123size=150': thumbsSize150,
      };

      const headshot = {
        thumbs: thumbsString,
        url: URL,
      };
      const url = personController.getHeadShotWithSize(1, '', headshot, 150);
      expect(url).toBe(thumbsSize150);
    });

    it('should return the highest size of thumbs with stored_file_id', () => {
      const thumbsString = {
        'height-13942071308size=16x16': 16,
        'width-13942071308size=24x24': 24,
        '123size=100x100': thumbsSizeX,
        '123size=64': thumbsSize64,
        '123size=92': thumbsSize92,
        '123size=150': thumbsSize150,
      };

      const headshot = {
        thumbs: thumbsString,
        url: URL,
        stored_file_id: '123',
      };
      const url = personController.getHeadShotWithSize(1, '', headshot, 150);
      expect(url).toBe(thumbsSize150);
    });
  });

  describe('matchContactByPhoneNumber', () => {
    async function prepareInvalidData() {
      for (let i = 1; i <= 30; i += 1) {
        const person: Person = {
          id: i,
          created_at: i,
          modified_at: i,
          creator_id: i,
          is_new: false,
          version: i,
          company_id: 1,
          email: `cat${i.toString()}@ringcentral.com`,
          first_name: `dora${i.toString()}`,
          last_name: `bruce${i.toString()}`,
          display_name: `dora${i.toString()} bruce${i.toString()}`,
        };
        await entityCacheController.put(person);
      }
    }
    async function preparePhoneNumData() {
      for (let i = 1; i <= 30; i += 1) {
        const person: Person = {
          id: i,
          created_at: i,
          modified_at: i,
          creator_id: i,
          is_new: false,
          version: i,
          company_id: 1,
          email: `cat${i.toString()}@ringcentral.com`,
          first_name: `dora${i.toString()}`,
          last_name: `bruce${i.toString()}`,
          display_name: `dora${i.toString()} bruce${i.toString()}`,
          sanitized_rc_extension: {
            extensionNumber: `${i}`,
            type: 'User',
          },
        };
        await entityCacheController.put(person);
      }
      for (let i = 31; i <= 35; i += 1) {
        const person: Person = {
          id: i,
          created_at: i,
          modified_at: i,
          creator_id: i,
          is_new: false,
          version: i,
          company_id: 1,
          email: `cat${i.toString()}@ringcentral.com`,
          first_name: `dora${i.toString()}`,
          last_name: `bruce${i.toString()}`,
          display_name: `dora${i.toString()} bruce${i.toString()}`,
          rc_phone_numbers: [
            { id: i, phoneNumber: `65022700${i}`, usageType: 'DirectNumber' },
          ],
        };
        await entityCacheController.put(person);
      }
      for (let i = 36; i <= 37; i += 1) {
        const person: Person = {
          id: i,
          created_at: i,
          modified_at: i,
          creator_id: i,
          is_new: false,
          version: i,
          company_id: 1,
          email: `cat${i.toString()}@ringcentral.com`,
          first_name: `dora${i.toString()}`,
          last_name: `bruce${i.toString()}`,
          display_name: `dora${i.toString()} bruce${i.toString()}`,
          rc_phone_numbers: [
            {
              id: i,
              phoneNumber: '8885287464',
              usageType: 'MainCompanyNumber',
            },
            { id: i, phoneNumber: `65022700${i}`, usageType: 'DirectNumber' },
          ],
        };
        await entityCacheController.put(person);
      }
    }

    beforeEach(async () => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      setUp();
    });
    it('should return null when there is no phone number data', async () => {
      await prepareInvalidData();
      const result = await personController.matchContactByPhoneNumber(
        '123',
        ContactType.GLIP_CONTACT,
      );
      expect(result).toBeNull();
    });
    it('should return null when no one is matched', async () => {
      await prepareInvalidData();
      const result = await personController.matchContactByPhoneNumber(
        '6502274787',
        ContactType.GLIP_CONTACT,
      );
      expect(result).toBeNull();
    });
    it('should return when short number is matched', async () => {
      await preparePhoneNumData();
      const result = await personController.matchContactByPhoneNumber(
        '21',
        ContactType.GLIP_CONTACT,
      );
      expect(result).not.toBeNull();
      expect(result.id).toBe(21);
    });
    it('should return when long number is matched', async () => {
      await preparePhoneNumData();
      const result = await personController.matchContactByPhoneNumber(
        '6502270033',
        ContactType.GLIP_CONTACT,
      );
      expect(result).not.toBeNull();
      expect(result.id).toBe(33);
    });
    it('should return when there is two more long number and long number is matched', async () => {
      await preparePhoneNumData();
      const result = await personController.matchContactByPhoneNumber(
        '6502270036',
        ContactType.GLIP_CONTACT,
      );
      expect(result).not.toBeNull();
      expect(result.id).toBe(36);
    });
  });

  describe('refreshPersonData()', () => {
    it('should call get once when has requestController', async () => {
      const requestController = {
        get: jest.fn().mockResolvedValue({}),
      };
      jest
        .spyOn(entitySourceController, 'getRequestController')
        .mockReturnValue(requestController);
      personController.refreshPersonData(1);
      expect(requestController.get).toHaveBeenCalledTimes(1);
    });
  });
});
