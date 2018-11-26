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
    it('doFuzzySearchPersons, with empty', async () => {
      personService.setSupportCache(true);
      const result = await personService.doFuzzySearchPersons('name', false);
      expect(result.sortableModels.length).toBe(0);
    });
  });

  describe('getPersonsByGroupId', () => {
    const groupService = new GroupService();
    const group = { id: 10, members: [1, 2, 3] };

    beforeEach(() => {
      GroupService.getInstance = jest.fn().mockReturnValue(groupService);
    });

    it('should return group members if has the group', async () => {
      const persons = [{ id: 1 }, { id: 2 }, { id: 3 }];
      daoManager.getDao.mockReturnValue(personDao);
      personDao.getPersonsByIds.mockResolvedValueOnce(persons);
      groupService.getGroupById.mockResolvedValueOnce(group);

      const res = await personService.getPersonsByGroupId(group.id);
      expect(res).toMatchObject(persons);
      expect(personDao.getPersonsByIds).toBeCalledWith(group.members);
      expect(groupService.getGroupById).toBeCalledWith(group.id);
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

  describe('buildPersonFeatureMap', () => {
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
      expect(res.get(FEATURE_TYPE.MESSAGE)).toBe(
        FEATURE_STATUS.INVISIBLE,
      );
      expect(spy).toBeCalledWith(pseudoPerson.id);
    });
  });
});
