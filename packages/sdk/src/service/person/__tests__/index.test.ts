/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-04-10 15:09:16
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />
import PersonService from '../../../service/person';
import { daoManager, PersonDao } from '../../../dao';

jest.mock('../../../dao');

describe('PersonService', () => {
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
});
