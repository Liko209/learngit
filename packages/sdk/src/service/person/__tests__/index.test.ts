/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-04-10 15:09:16
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />
import PersonService from '../../../service/person';
import GroupService, {
  FEATURE_TYPE,
  FEATURE_STATUS,
} from '../../../service/group';
import { daoManager, PersonDao } from '../../../dao';
import { Person } from '../../../models';
import { AccountService } from '../../account/accountService';
import { PHONE_NUMBER_TYPE, PhoneNumberInfo } from '../types';

jest.mock('../../../dao');
jest.mock('../../../service/group');

describe('PersonService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  const personService = new PersonService();
  const personDao = new PersonDao(null);

  describe('getPersonsByIds()', () => {
    it('should return all matched person', async () => {
      personService.getById = jest.fn();
      await personService.getPersonsByIds([1, 2]);

      expect(personService.getById).toHaveBeenCalledTimes(2);
    });

    it('should return [] by default', () => {
      expect(personService.getPersonsByIds([123])).rejects.toThrow();
    });

    it('should return [] when no id was given', async () => {
      const result = await personService.getPersonsByIds([]);
      expect(result).toEqual([]);
    });

    it('should throw error when ids was not array', async () => {
      try {
        await personService.getPersonsByIds(123);
      } catch (e) {
        expect(e.message).toEqual('ids must be an array.');
      }
    });
  });

  describe('getPersonsByPrefix()', () => {
    it('should return all matched person', async () => {
      const mock = [{ id: 123, display_name: 'Albert' }];
      daoManager.getDao.mockReturnValue(personDao);
      personDao.getPersonsByPrefix.mockReturnValue(mock);
      const result = await personService.getPersonsByPrefix('A');

      expect(result).toEqual(mock);
    });
  });

  describe('getPersonsCountByPrefix()', () => {
    it('should return all matched person', async () => {
      // personService.getById = jest.fn();
      const mock = 3;
      daoManager.getDao.mockReturnValue(personDao);
      personDao.getPersonsCountByPrefix.mockReturnValue(mock);
      const result = await personService.getPersonsCountByPrefix('A');

      expect(result).toEqual(mock);
    });
  });

  describe('getPersonsOfEachPrefix()', () => {
    it('should return all matched person', async () => {
      const mock = { A: [{ id: 123, display_name: 'Albert' }] };
      daoManager.getDao.mockReturnValue(personDao);
      personDao.getPersonsOfEachPrefix.mockReturnValue(mock);
      const result = await personService.getPersonsOfEachPrefix();

      expect(result).toEqual(mock);
    });
  });

  describe('getAllCount()', () => {
    it('should return all matched person length', async () => {
      const mock = 3;
      daoManager.getDao.mockReturnValue(personDao);
      personDao.getAllCount.mockReturnValue(mock);
      const result = await personService.getAllCount();
      expect(result).toBe(mock);
    });
  });

  describe('doFuzzySearchPersons', () => {
    function prepareDataForSearchUTs() {
      personService.enableCache();
      const cacheManager = personService.getCacheManager();
      for (let i = 1; i <= 10000; i += 1) {
        const person: Person = {
          id: i,
          created_at: i,
          modified_at: i,
          creator_id: i,
          is_new: false,
          deactivated: false,
          version: i,
          company_id: 1,
          email: `cat${i.toString()}@ringcentral.com`,
          me_group_id: 1,
          first_name: `dora${i.toString()}`,
          last_name: `bruce${i.toString()}`,
          display_name: `dora${i.toString()} bruce${i.toString()}`,
        };
        cacheManager.set(person);
      }

      for (let i = 10001; i <= 20000; i += 1) {
        const person: Person = {
          id: i,
          created_at: i,
          modified_at: i,
          creator_id: i,
          is_new: false,
          deactivated: false,
          version: i,
          company_id: 1,
          email: `dog${i.toString()}@ringcentral.com`,
          me_group_id: 1,
          first_name: `ben${i.toString()}`,
          last_name: `niu${i.toString()}`,
          display_name: `ben${i.toString()} niu${i.toString()}`,
        };
        cacheManager.set(person);
      }
    }

    prepareDataForSearchUTs();

    it('search parts of data, with multi terms', async () => {
      const result = await personService.doFuzzySearchPersons(
        'dora bruce',
        false,
      );
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('dora');
      expect(result.terms[1]).toBe('bruce');
    });

    it('search parts of data, with single term', async () => {
      const result = await personService.doFuzzySearchPersons('dora', false);
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('dora');
    });

    it('search parts of data, ignore case', async () => {
      let result = await personService.doFuzzySearchPersons(
        'doRa,Bruce',
        false,
      );
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('doRa');
      expect(result.terms[1]).toBe('Bruce');

      result = await personService.doFuzzySearchPersons('doXa', false);
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('doXa');

      result = await personService.doFuzzySearchPersons('doXa Bruce', false);
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(2);
    });

    it('search parts of data, email', async () => {
      const result = await personService.doFuzzySearchPersons('cat', false);
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(1);
      expect(result.terms[0]).toBe('cat');
    });

    it('search parts of data, email and name, not match', async () => {
      const result = await personService.doFuzzySearchPersons('cat dog', false);
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(2);
      expect(result.terms[0]).toBe('cat');
      expect(result.terms[1]).toBe('dog');
    });
    it('search parts of data, with arrangeIds', async () => {
      const result = await personService.doFuzzySearchPersons('dora', false, [
        3,
        1,
        2,
        10001,
        10002,
      ]);
      expect(result.sortableModels.length).toBe(3);
      expect(result.sortableModels[0].displayName).toBe('dora1 bruce1');
      expect(result.sortableModels[1].displayName).toBe('dora2 bruce2');
      expect(result.sortableModels[2].displayName).toBe('dora3 bruce3');
    });

    it('search parts of data, exclude self', async () => {
      const accountService = new AccountService();
      AccountService.getInstance = jest.fn().mockReturnValue(accountService);
      accountService.getCurrentUserId = jest.fn().mockImplementation(() => 1);
      const result = await personService.doFuzzySearchPersons('dora', true);
      expect(result.sortableModels.length).toBe(9999);
    });

    it('search parts of data, searchKey is empty, return all if search key is empty', async () => {
      const accountService = new AccountService();
      AccountService.getInstance = jest.fn().mockReturnValue(accountService);
      accountService.getCurrentUserId = jest.fn().mockImplementation(() => 1);
      const result = await personService.doFuzzySearchPersons(
        '',
        undefined,
        undefined,
        true,
      );
      expect(result.sortableModels.length).toBe(20000);
    });

    it('search parts of data, searchKey is empty, can not return all if search key is empty', async () => {
      const accountService = new AccountService();
      AccountService.getInstance = jest.fn().mockReturnValue(accountService);
      accountService.getCurrentUserId = jest.fn().mockImplementation(() => 1);
      const result = await personService.doFuzzySearchPersons(
        '',
        undefined,
        undefined,
        false,
      );
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });

    it('search parts of data, searchKey not empty, can not return all if search key is empty', async () => {
      const accountService = new AccountService();
      AccountService.getInstance = jest.fn().mockReturnValue(accountService);
      accountService.getCurrentUserId = jest.fn().mockImplementation(() => 1);
      const result = await personService.doFuzzySearchPersons(
        'dora',
        undefined,
        undefined,
        false,
      );
      expect(result.sortableModels.length).toBe(10000);
      expect(result.terms.length).toBe(1);
    });

    it('search parts of data, searchKey is empty, excludeSelf, return all if search key is empty', async () => {
      const accountService = new AccountService();
      AccountService.getInstance = jest.fn().mockReturnValue(accountService);
      accountService.getCurrentUserId = jest.fn().mockImplementation(() => 1);
      const result = await personService.doFuzzySearchPersons(
        '',
        true,
        undefined,
        true,
      );
      expect(result.sortableModels.length).toBe(19999);
    });

    it('search parts of data, searchKey is empty, excludeSelf, arrangeIds, return all if search key is empty', async () => {
      const accountService = new AccountService();
      AccountService.getInstance = jest.fn().mockReturnValue(accountService);
      accountService.getCurrentUserId = jest.fn().mockImplementation(() => 1);
      const result = await personService.doFuzzySearchPersons(
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
      const accountService = new AccountService();
      AccountService.getInstance = jest.fn().mockReturnValue(accountService);
      accountService.getCurrentUserId = jest.fn().mockImplementation(() => 1);
      const result = await personService.doFuzzySearchPersons(
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
      const accountService = new AccountService();
      AccountService.getInstance = jest.fn().mockReturnValue(accountService);
      accountService.getCurrentUserId = jest.fn().mockImplementation(() => 1);
      const result = await personService.doFuzzySearchPersons(
        '',
        true,
        [3, 1, 2, 10001, 10002],
        false,
      );
      expect(result.sortableModels.length).toBe(0);
      expect(result.terms.length).toBe(0);
    });
  });

  describe('getPersonsByGroupId()', () => {
    const groupService = new GroupService();
    const group = { id: 10, members: [1, 2, 3] };

    beforeEach(() => {
      GroupService.getInstance = jest.fn().mockReturnValue(groupService);
    });

    it('should return group members from cache if has cache', async () => {
      const persons = [{ id: 3 }, { id: 4 }, { id: 5 }];

      daoManager.getDao.mockReturnValue(personDao);
      jest
        .spyOn(personService, 'getMultiEntitiesFromCache')
        .mockResolvedValueOnce(persons);

      personDao.getPersonsByIds.mockResolvedValueOnce(persons);
      groupService.getGroupById.mockResolvedValueOnce(group);

      const res = await personService.getPersonsByGroupId(group.id);
      expect(res).toMatchObject(persons);
      expect(personDao.getPersonsByIds).not.toBeCalled();
      expect(groupService.getGroupById).toBeCalledWith(group.id);
    });

    it('should return group members from DB if has the group and no cache', async () => {
      const persons = [{ id: 1 }, { id: 2 }, { id: 3 }];
      daoManager.getDao.mockReturnValue(personDao);

      const spy = jest.spyOn(personService, 'getMultiEntitiesFromCache');

      spy.mockResolvedValueOnce([]);
      personDao.getPersonsByIds.mockResolvedValueOnce(persons);
      groupService.getGroupById.mockResolvedValueOnce(group);

      const res = await personService.getPersonsByGroupId(group.id);
      expect(res).toMatchObject(persons);
      expect(personDao.getPersonsByIds).toBeCalledWith(group.members);
      expect(groupService.getGroupById).toBeCalledWith(group.id);
      expect(spy).toBeCalledTimes(1);
    });

    it('should return null when no group exist', async () => {
      daoManager.getDao.mockReturnValue(personDao);
      groupService.getGroupById.mockResolvedValueOnce(null);

      const res = await personService.getPersonsByGroupId(group.id);
      expect(res).toMatchObject([]);
      expect(personDao.getPersonsByIds).not.toBeCalled();
      expect(groupService.getGroupById).toBeCalledWith(group.id);
    });
  });

  describe('buildPersonFeatureMap()', () => {
    const personId = 1;
    const person = { id: personId };
    it('should not have conference permission for person', async () => {
      const spy = jest.spyOn(personService, 'getById');
      spy.mockResolvedValueOnce(person);
      const res = await personService.buildPersonFeatureMap(personId);
      expect(res.get(FEATURE_TYPE.CONFERENCE)).toBeFalsy;
      expect(spy).toBeCalled;
    });

    it('should have message for person', async () => {
      const spy = jest.spyOn(personService, 'getById');
      spy.mockResolvedValueOnce(person);
      const res = await personService.buildPersonFeatureMap(personId);
      expect(res.get(FEATURE_TYPE.MESSAGE)).toBe(FEATURE_STATUS.ENABLE);
      expect(spy).toBeCalledWith(person.id);
    });

    it('should not have message for pseudo person', async () => {
      const pseudoPerson = { id: personId, is_pseudo_user: true };
      const spy = jest.spyOn(personService, 'getById');
      spy.mockResolvedValueOnce(pseudoPerson);
      const res = await personService.buildPersonFeatureMap(personId);
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
      const accountService = new AccountService();
      AccountService.getInstance = jest
        .fn()
        .mockReturnValueOnce(accountService);
      accountService.getCurrentCompanyId = jest.fn().mockReturnValueOnce(1);
    });

    it('should not return extension id for guest user', () => {
      expect(
        personService.getAvailablePhoneNumbers(
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
          personService.getAvailablePhoneNumbers(1, rcPhones, rcExt),
        ).toEqual(expectRes);
      },
    );
  });
});
