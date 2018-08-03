/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-18 17:10:45
 * Copyright © RingCentral. All rights reserved.
 */
import BaseService from '../../service/BaseService';
import PersonDao from '../../dao/person';
import PersonAPI from '../../api/glip/person';
import handleData from './handleData';
import { daoManager } from '../../dao';
import { IPagination } from '../../types';
import { Person } from '../../models'; // eslint-disable-line
import { SOCKET } from '../eventKey';

export default class PersonService extends BaseService<Person> {
  static serviceName = 'PersonService';

  constructor() {
    const subscription = {
      [SOCKET.PERSON]: handleData,
      [SOCKET.ITEM]: handleData,
    };
    super(PersonDao, PersonAPI, handleData, subscription);
  }

  async getPersonsByIds(ids: number[]): Promise<(Person | null)[]> {
    if (!Array.isArray(ids)) {
      throw new Error('ids must be an array.');
    }
    if (ids.length === 0) {
      return [];
    }
    const persons = await Promise.all(
      ids.map(async id => {
        const person = await this.getById(id);
        return person;
      }),
    );

    return persons.filter(person => person !== null);
  }

  async getPersonsByPrefix(prefix: string, pagination?: Partial<IPagination>): Promise<Person[]> {
    const personDao = daoManager.getDao(PersonDao);
    return personDao.getPersonsByPrefix(prefix, pagination);
  }

  async getPersonsOfEachPrefix(limit?: number): Promise<Map<string, Person[]>> {
    const personDao = daoManager.getDao(PersonDao);
    return personDao.getPersonsOfEachPrefix({ limit });
  }

  async getPersonsCountByPrefix(prefix: string): Promise<number> {
    const personDao = daoManager.getDao(PersonDao);
    return personDao.getPersonsCountByPrefix(prefix);
  }

  async getAllCount() {
    const personDao = daoManager.getDao(PersonDao);
    return personDao.getAllCount();
  }
}
