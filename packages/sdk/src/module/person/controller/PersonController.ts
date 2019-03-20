/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-21 17:18:00
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import {
  Person,
  HeadShotModel,
  PhoneNumberModel,
  PHONE_NUMBER_TYPE,
  PhoneNumberInfo,
  SanitizedExtensionModel,
  CALL_ID_USAGE_TYPE,
} from '../entity';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { Raw } from '../../../framework/model';
import PersonAPI from '../../../api/glip/person';
import { AccountGlobalConfig } from '../../../service/account/config';
import { FEATURE_TYPE, FEATURE_STATUS } from '../../group/entity';
import { IEntityCacheSearchController } from '../../../framework/controller/interface/IEntityCacheSearchController';
import { PersonDataController } from './PersonDataController';
import { AuthGlobalConfig } from '../../../service/auth/config';
import { ContactType } from '../types';

const PersonFlags = {
  deactivated: 2,
  has_registered: 4,
  is_removed_guest: 1024,
  am_removed_guest: 2048,
};

const SERVICE_ACCOUNT_EMAIL = 'service@glip.com';
const HEADSHOT_THUMB_WIDTH = 'width';
const HEADSHOT_THUMB_HEIGHT = 'height';
const HEADSHOT_THUMB_SIZE_LIMIT = 500;
const SIZE = 'size';

class PersonController {
  private _entitySourceController: IEntitySourceController<Person>;
  private _cacheSearchController: IEntityCacheSearchController<Person>;

  constructor() {}

  setDependentController(
    entitySourceController: IEntitySourceController<Person>,
    _cacheSearchController: IEntityCacheSearchController<Person>,
  ) {
    this._entitySourceController = entitySourceController;
    this._cacheSearchController = _cacheSearchController;
  }

  async handleIncomingData(persons: Raw<Person>[]) {
    await new PersonDataController().handleIncomingData(persons);
  }

  async getPersonsByIds(ids: number[]): Promise<Person[]> {
    if (!Array.isArray(ids)) {
      throw new Error('ids must be an array.');
    }

    if (ids.length === 0) {
      return [];
    }

    return await this._entitySourceController.batchGet(ids);
  }

  async getAllCount() {
    return await this._entitySourceController.getTotalCount();
  }

  private _getHeadShotByVersion(
    uid: number,
    headShotVersion: string,
    size: number,
  ) {
    const token = AuthGlobalConfig.getGlipToken();
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

  private _getHighestResolutionHeadshotUrlFromThumbs(
    thumbs: { key: string; value: string }[],
    stored_file_id?: string,
  ): string {
    const keys = Object.keys(thumbs);
    let maxKey = keys[0];
    let maxWidth: number = 0;
    let firstKey: string = '';
    for (let i = 0; i < keys.length; i++) {
      if (
        keys[i].startsWith(HEADSHOT_THUMB_WIDTH) ||
        keys[i].startsWith(HEADSHOT_THUMB_HEIGHT)
      ) {
        continue;
      }
      if (stored_file_id && !keys[i].startsWith(stored_file_id)) {
        continue;
      }

      if (firstKey === '') {
        firstKey = keys[i];
      }

      const index = keys[i].indexOf(SIZE);
      if (index !== -1) {
        const sizeString = keys[i].substr(index + SIZE.length + 1);
        const sizeWidth = Number(sizeString);
        if (sizeWidth < HEADSHOT_THUMB_SIZE_LIMIT) {
          if (sizeWidth > maxWidth) {
            maxWidth = sizeWidth;
            maxKey = keys[i];
          }
        }
      }
    }
    let url = thumbs[firstKey];
    if (maxWidth !== 0) {
      url = thumbs[maxKey];
    }
    return url;
  }

  getHeadShotWithSize(
    uid: number,
    headshot_version: string,
    headshot: HeadShotModel,
    size: number,
  ) {
    let url: string | null = null;
    if (headshot_version) {
      url = this._getHeadShotByVersion(uid, headshot_version, size);
    } else if (headshot) {
      if (typeof headshot === 'string') {
        url = headshot;
      } else {
        if (headshot.thumbs) {
          url = this._getHighestResolutionHeadshotUrlFromThumbs(
            headshot.thumbs,
            headshot.stored_file_id,
          );
        }
        if (!url) {
          url = headshot.url;
        }
      }
    }

    return url;
  }

  async buildPersonFeatureMap(
    personId: number,
  ): Promise<Map<FEATURE_TYPE, FEATURE_STATUS>> {
    const actionMap = new Map<FEATURE_TYPE, FEATURE_STATUS>();

    const person = (await this._entitySourceController.get(personId)) as Person;
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

  private _isVisible(person: Person): boolean {
    return person.email !== SERVICE_ACCOUNT_EMAIL;
  }

  private _hasTrueValue(person: Person, key: number) {
    if (person.flags === undefined) {
      return false;
    }
    return (person.flags & key) === key;
  }

  private _isDeactivated(person: Person): boolean {
    return (
      person.deactivated || this._hasTrueValue(person, PersonFlags.deactivated)
    );
  }

  isValid(person: Person) {
    return (
      !this._isDeactivated(person) &&
      this._isVisible(person) &&
      !this._hasTrueValue(person, PersonFlags.is_removed_guest) &&
      !this._hasTrueValue(person, PersonFlags.am_removed_guest) &&
      !person.is_pseudo_user
    );
  }

  getAvailablePhoneNumbers(
    companyId: number,
    phoneNumbersData?: PhoneNumberModel[],
    extensionData?: SanitizedExtensionModel,
  ) {
    const availNumbers: PhoneNumberInfo[] = [];
    const isCoWorker = AccountGlobalConfig.getCurrentCompanyId() === companyId;
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

  async matchContactByPhoneNumber(
    e164PhoneNumber: string,
    contactType: ContactType,
  ): Promise<Person | null> {
    const result = await this._cacheSearchController.searchEntities(
      (person: Person, terms: string[]) => {
        if (
          person.sanitized_rc_extension &&
          person.sanitized_rc_extension.extensionNumber === e164PhoneNumber
        ) {
          return {
            id: person.id,
            displayName: name,
            entity: person,
          };
        }

        if (person.rc_phone_numbers) {
          for (const index in person.rc_phone_numbers) {
            if (
              person.rc_phone_numbers[index].phoneNumber === e164PhoneNumber
            ) {
              return {
                id: person.id,
                displayName: name,
                entity: person,
              };
            }
          }
        }
        return null;
      },
    );

    return result && result.sortableModels.length > 0
      ? result.sortableModels[0].entity
      : null;
  }
}

export { PersonController };
