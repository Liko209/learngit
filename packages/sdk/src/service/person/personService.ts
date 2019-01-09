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
import {
  Person,
  PhoneNumberModel,
  SanitizedExtensionModel,
} from '../../module/person/entity';

import { SortableModel } from '../../models';

import {
  CALL_ID_USAGE_TYPE,
  PHONE_NUMBER_TYPE,
  PhoneNumberInfo,
  SortingOrder,
} from './types';
import { SOCKET } from '../eventKey';
import { AUTH_GLIP_TOKEN } from '../../dao/auth/constants';
import { UserConfig } from '../account/UserConfig';

class PersonService extends BaseService<Person> {
  static serviceName = 'PersonService';

  constructor() {
    const subscription = {
      [SOCKET.PERSON]: handleData,
    };
    super(PersonDao, PersonAPI, handleData, subscription);
    this.enableCache();
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
    if (this.isCacheInitialized()) {
      return this.getEntitiesFromCache().then(persons => persons.length);
    }
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
      if (memberIds.length > 0) {
        if (this.isCacheInitialized()) {
          return await this.getMultiEntitiesFromCache(
            memberIds,
            (entity: Person) => {
              return this._isValid(entity);
            },
          );
        }
        const personDao = daoManager.getDao(PersonDao);
        return await personDao.getPersonsByIds(memberIds);
      }
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

  async doFuzzySearchPersons(
    searchKey?: string,
    excludeSelf?: boolean,
    arrangeIds?: number[],
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Person>[];
  } | null> {
    let currentUserId: number | null = null;
    if (excludeSelf) {
      currentUserId = UserConfig.getCurrentUserId();
    }
    return this.searchEntitiesFromCache(
      (person: Person, terms: string[]) => {
        do {
          if (
            !this._isValid(person) ||
            (currentUserId && person.id === currentUserId)
          ) {
            break;
          }

          if (!fetchAllIfSearchKeyEmpty && terms.length === 0) {
            break;
          }

          let name: string = this.getName(person);
          let sortValue = 0;

          if (terms.length > 0) {
            if (this.isFuzzyMatched(name, terms)) {
              sortValue = SortingOrder.FullNameMatching;
              if (
                person.first_name &&
                this.isStartWithMatched(person.first_name, [terms[0]])
              ) {
                sortValue += SortingOrder.FirstNameMatching;
              }
              if (
                person.last_name &&
                this.isStartWithMatched(person.last_name, terms)
              ) {
                sortValue += SortingOrder.LastNameMatching;
              }
            } else if (
              person.email &&
              this.isFuzzyMatched(person.email, terms)
            ) {
              sortValue = SortingOrder.EmailMatching;
            } else {
              break;
            }
          }

          if (name.length <= 0) {
            name = this.getEmailAsName(person);
          }

          return {
            id: person.id,
            displayName: name,
            firstSortKey: sortValue,
            secondSortKey: name.toLowerCase(),
            entity: person,
          };
        } while (false);
        return null;
      },
      searchKey,
      arrangeIds,
      (personA: SortableModel<Person>, personB: SortableModel<Person>) => {
        if (personA.firstSortKey > personB.firstSortKey) {
          return -1;
        }
        if (personA.firstSortKey < personB.firstSortKey) {
          return 1;
        }

        if (personA.secondSortKey < personB.secondSortKey) {
          return -1;
        }
        if (personA.secondSortKey > personB.secondSortKey) {
          return 1;
        }
        return 0;
      },
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
    if (person.email) {
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
    return '';
  }

  getFullName(person: Person) {
    const name = this.getName(person);
    return name.length > 0 ? name : this.getEmailAsName(person);
  }

  private _canMessageWithPerson(person: Person) {
    return !person.is_pseudo_user;
  }

  private _isValid(person: Person) {
    return !person.deactivated && !person.is_pseudo_user;
  }

  getAvailablePhoneNumbers(
    companyId: number,
    phoneNumbersData?: PhoneNumberModel[],
    extensionData?: SanitizedExtensionModel,
  ) {
    const availNumbers: PhoneNumberInfo[] = [];
    const isCoWorker = UserConfig.getCurrentCompanyId() === companyId;
    if (isCoWorker && extensionData) {
      availNumbers.push({
        type: PHONE_NUMBER_TYPE.EXTENSION_NUMBER,
        phoneNumber: extensionData.extensionNumber,
      });
    }
    // filter out company main number
    if (phoneNumbersData) {
      phoneNumbersData.forEach((element: PhoneNumberModel) => {
        if (element.usageType === CALL_ID_USAGE_TYPE.DIRECT_NUMBER) {
          availNumbers.push({
            type: PHONE_NUMBER_TYPE.DIRECT_NUMBER,
            phoneNumber: element.phoneNumber,
          });
        }
      });
    }
    return availNumbers;
  }
}

export { PersonService };
