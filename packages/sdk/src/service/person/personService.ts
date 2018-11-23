/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 14:40:50
 * Copyright © RingCentral. All rights reserved.
 */

import BaseService from '../../service/BaseService';
import PersonDao from '../../dao/person';
import PersonAPI from '../../api/glip/person';
import handleData from './handleData';
import GroupService, { FEATURE_ACTION_STATUS, FEATURE_TYPE } from '../group';
import { daoManager, AuthDao } from '../../dao';
import { IPagination } from '../../types';
import { Person } from '../../models'; // eslint-disable-line
import { SOCKET } from '../eventKey';
import { AUTH_GLIP_TOKEN } from '../../dao/auth/constants';
import { ErrorParser } from '../../utils/error';
class PersonService extends BaseService<Person> {
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
      ids.map(async (id: number) => {
        const person = await this.getById(id);
        return person;
      }),
    );

    return persons.filter(person => person !== null);
  }

  async getPersonsByPrefix(
    prefix: string,
    pagination?: Partial<IPagination>,
  ): Promise<Person[]> {
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
  getHeadShot(uid: number, headShotVersion: string, size: number) {
    const authDao = daoManager.getKVDao(AuthDao);
    const token = authDao.get(AUTH_GLIP_TOKEN);
    const glipToken = token && token.replace(/\"/g, '');
    if (headShotVersion) {
      return PersonAPI.getHeadShotUrl({
        uid,
        headShotVersion,
        size,
        glipToken,
      });
    }
    return '';
  }

  async getPersonsByGroupId(groupId: number): Promise<Person[]> {
    const groupService: GroupService = GroupService.getInstance();
    const group = await groupService.getGroupById(groupId);
    if (group) {
      const memberIds = group.members;
      const personDao = daoManager.getDao(PersonDao);
      return await personDao.getPersonsByIds(memberIds);
    }
    return [];
  }

  async buildPersonFeatureActionMap(
    personId: number,
  ): Promise<Map<FEATURE_TYPE, FEATURE_ACTION_STATUS>> {
    try {
      const actionMap = new Map<FEATURE_TYPE, FEATURE_ACTION_STATUS>();
      actionMap.set(FEATURE_TYPE.MESSAGE, FEATURE_ACTION_STATUS.ENABLE);
      actionMap.set(FEATURE_TYPE.CONFERENCE, FEATURE_ACTION_STATUS.INVISIBLE);

      // To-Do
      actionMap.set(FEATURE_TYPE.VIDEO, FEATURE_ACTION_STATUS.INVISIBLE);
      actionMap.set(FEATURE_TYPE.CALL, FEATURE_ACTION_STATUS.INVISIBLE);
      return actionMap;
    } catch (error) {
      throw ErrorParser.parse(error);
    }
  }

  generatePersonDisplayName(
    firstName: string | undefined,
    lastName: string | undefined,
    email: string,
  ) {
    let name = '';
    if (firstName && firstName.length > 0) {
      name += firstName;
    }

    if (lastName && lastName.length > 0) {
      name += ' ';
      name += lastName;
    }

    if (name) {
      name = email;
    }

    return name;
  }
}

export { PersonService };
