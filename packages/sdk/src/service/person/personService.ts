/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 14:40:50
 * Copyright © RingCentral. All rights reserved.
 */

import BaseService from '../../service/BaseService';
import PersonDao from '../../dao/person';
import PersonAPI from '../../api/glip/person';
import handleData from './handleData';
import GroupService, { FEATURE_STATUS, FEATURE_TYPE } from '../group';
import { daoManager, AuthDao } from '../../dao';
import { IPagination } from '../../types';
import { Person, SortableModel } from '../../models'; // eslint-disable-line
import { SOCKET } from '../eventKey';
import { AUTH_GLIP_TOKEN } from '../../dao/auth/constants';
import { AccountService } from '../account/accountService';

class PersonService extends BaseService<Person> {
  static serviceName = 'PersonService';
  constructor() {
    const subscription = {
      [SOCKET.PERSON]: handleData,
      [SOCKET.ITEM]: handleData,
    };
    super(PersonDao, PersonAPI, handleData, subscription);
    this.setSupportCache(true);
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

  async buildPersonFeatureMap(
    personId: number,
  ): Promise<Map<FEATURE_TYPE, FEATURE_STATUS>> {
    const actionMap = new Map<FEATURE_TYPE, FEATURE_STATUS>();

    const person = (await this.getById(personId)) as Person;
    if (person) {
      actionMap.set(FEATURE_TYPE.CONFERENCE, FEATURE_STATUS.INVISIBLE);

      actionMap.set(
        FEATURE_TYPE.MESSAGE,
        this._canMessageWithPerson(person)
          ? FEATURE_STATUS.ENABLE
          : FEATURE_STATUS.INVISIBLE,
      );

      // To-Do
      actionMap.set(FEATURE_TYPE.VIDEO, FEATURE_STATUS.INVISIBLE);
      actionMap.set(FEATURE_TYPE.CALL, FEATURE_STATUS.INVISIBLE);
    }
    return actionMap;
  }

  generatePersonDisplayName(
    firstName: string | undefined,
    lastName: string | undefined,
    email: string,
  ) {
    let name = '';
    if (firstName) {
      name += firstName;
    }

    if (lastName) {
      if (name.length > 0) {
        name += ' ';
      }
      name += lastName;
    }

    if (name.length === 0) {
      name = email;
    }

    return name;
  }

  async doFuzzySearchPersons(
    searchKey: string,
    excludeSelf: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Person>[];
  } | null> {
    let currentUserId: number | null = null;
    if (excludeSelf) {
      const accountService: AccountService = AccountService.getInstance();
      currentUserId = accountService.getCurrentUserId();
    }
    return this.searchEntitiesFromCache(
      (person: Person, terms: string[]) => {
        if (currentUserId && person.id === currentUserId) {
          return null;
        }
        let name: string = this.getName(person);
        if (
          this.isFuzzyMatched(name, terms) ||
          this.isFuzzyMatched(person.email, terms)
        ) {
          if (name.length <= 0) {
            name = this.getEmailAsName(person);
          }

          return {
            id: person.id,
            displayName: name,
            sortKey: name.toLowerCase(),
            entity: person,
          };
        }
        return null;
      },
      searchKey,
      undefined,
      this.sortEntitiesByName.bind(this),
    );
  }

  getName(person: Person) {
    if (person.display_name) {
      return person.display_name;
    }
    if (person.first_name && person.last_name) {
      return `${person.first_name} ${person.last_name}`;
    }
    return '';
  }

  getEmailAsName(person: Person) {
    const name = person.email.split('@')[0];
    const firstUpperCase = (parseString: string) => {
      if (!parseString[0]) {
        return '';
      }
      return parseString[0].toUpperCase().concat(parseString.slice(1));
    };

    return name
      .split('.')
      .map((v: string) => firstUpperCase(v))
      .join(' ');
  }

  getFullName(person: Person) {
    const name = this.getName(person);
    return name.length > 0 ? name : this.getEmailAsName(person);
  }

  private _canMessageWithPerson(person: Person) {
    return !person.is_pseudo_user;
  }
}

export { PersonService };
