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
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { Raw } from 'sdk/framework/model';
import PersonAPI from 'sdk/api/glip/person';
import { AccountUserConfig, AuthUserConfig } from 'sdk/module/account/config';
import { FEATURE_TYPE, FEATURE_STATUS } from '../../group/entity';
import { IEntityCacheSearchController } from 'sdk/framework/controller/interface/IEntityCacheSearchController';
import { PersonDataController } from './PersonDataController';
import { ContactType } from '../types';
import notificationCenter from 'sdk/service/notificationCenter';
import { ENTITY } from 'sdk/service/eventKey';
import { SYNC_SOURCE, ChangeModel } from 'sdk/module/sync/types';
import { FileTypeUtils } from 'sdk/utils/file/FileTypeUtils';
import { PhoneParserUtility } from 'sdk/utils/phoneParser';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';
import { PersonEntityCacheController } from './PersonEntityCacheController';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PhoneNumberService } from 'sdk/module/phoneNumber';

const PersonFlags = {
  is_webmail: 1,
  deactivated: 2,
  has_registered: 4,
  externally_registered: 8,
  externally_registered_password_set: 16,
  rc_registered: 32,
  locked: 64,
  amazon_ses_suppressed: 128,
  is_kip: 256,
  has_bogus_email: 512,
  is_removed_guest: 1024,
  am_removed_guest: 2048,
  is_hosted: 4096,
  invited_by_me: 8192,
};

const SERVICE_ACCOUNT_EMAIL = 'service@glip.com';
const HEADSHOT_THUMB_WIDTH = 'width';
const HEADSHOT_THUMB_HEIGHT = 'height';

const SIZE = 'size';

class PersonController {
  private _entitySourceController: IEntitySourceController<Person>;
  private _entityCacheController: IEntityCacheController<Person>;

  constructor() {}

  setDependentController(
    entitySourceController: IEntitySourceController<Person>,
    _cacheSearchController: IEntityCacheSearchController<Person>,
    entityCacheController: IEntityCacheController<Person>,
  ) {
    this._entitySourceController = entitySourceController;
    this._entityCacheController = entityCacheController;
  }

  async handleIncomingData(
    persons: Raw<Person>[],
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) {
    await new PersonDataController(
      this._entitySourceController,
    ).handleIncomingData(persons, source, changeMap);
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
    const auth = new AuthUserConfig();
    const token = auth.getGlipToken();
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
    desiredSize: number,
    stored_file_id?: string,
  ): string | null {
    const keys = Object.keys(thumbs);
    let matchKey: string = '';
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

      const index = keys[i].indexOf(SIZE);
      if (index !== -1) {
        const sizeString = keys[i].substr(index + SIZE.length + 1);
        const sizeWidth = Number(sizeString);
        if (sizeWidth === desiredSize) {
          matchKey = keys[i];
          break;
        }
      }
    }

    if (matchKey) {
      return thumbs[matchKey];
    }
    return null;
  }

  getHeadShotWithSize(
    uid: number,
    headshot_version: string,
    headshot: HeadShotModel,
    size: number,
  ) {
    if (typeof headshot !== 'string') {
      let url: string | null = null;
      if (FileTypeUtils.isGif(headshot.url)) {
        return headshot.url;
      }
      if (headshot.thumbs) {
        url = this._getHighestResolutionHeadshotUrlFromThumbs(
          headshot.thumbs,
          size,
          headshot.stored_file_id,
        );
      }
      if (!url) {
        if (headshot_version) {
          url = this._getHeadShotByVersion(uid, headshot_version, size);
        } else {
          url = headshot.url;
        }
      }
      return url;
    }
    return headshot;
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

  private _isUnregistered(person: Person) {
    return person.flags === 0;
  }

  private _hasBogusEmail(person: Person) {
    return this._hasTrueValue(person, PersonFlags.has_bogus_email);
  }

  isCacheValid = (person: Person) => {
    return (
      !this._isUnregistered(person) &&
      this._isVisible(person) &&
      !this._hasTrueValue(person, PersonFlags.is_removed_guest) &&
      !this._hasTrueValue(person, PersonFlags.am_removed_guest) &&
      !person.is_pseudo_user &&
      !this._hasBogusEmail(person)
    );
  }

  isValid(person: Person): boolean {
    return this.isCacheValid(person) && !this._isDeactivated(person);
  }

  getAvailablePhoneNumbers(
    companyId: number,
    phoneNumbersData?: PhoneNumberModel[],
    extensionData?: SanitizedExtensionModel,
  ) {
    const availNumbers: PhoneNumberInfo[] = [];
    const userConfig = new AccountUserConfig();
    const isCoWorker = userConfig.getCurrentCompanyId() === companyId;
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
    phoneNumber: string,
    contactType: ContactType,
  ): Promise<Person | null> {
    if (!phoneNumber) {
      return null;
    }
    const phoneParserUtility = await PhoneParserUtility.getPhoneParser(
      phoneNumber,
      false,
    );
    if (!phoneParserUtility) {
      return null;
    }
    const e164Number = phoneParserUtility.getE164();

    const isShortNumber = phoneParserUtility.isShortNumber();
    const phoneNumberService = ServiceLoader.getInstance<PhoneNumberService>(
      ServiceConfig.PHONE_NUMBER_SERVICE,
    );
    const numberList = await phoneNumberService.generateMatchedPhoneNumberList(
      e164Number,
    );
    const cacheController = this
      ._entityCacheController as PersonEntityCacheController;

    const result: Person[] = [];

    const companyId =
      isShortNumber && new AccountUserConfig().getCurrentCompanyId();

    numberList &&
      numberList.forEach((item: string) => {
        const person = cacheController.getPersonByPhoneNumber(item);
        if (
          person &&
          !this._isDeactivated(person) &&
          (!isShortNumber || person.company_id === companyId)
        ) {
          result.push(person);
        }
      });
    return result.length ? result[0] : null;
  }

  public async refreshPersonData(personId: number): Promise<void> {
    const requestController = this._entitySourceController.getRequestController();
    if (requestController) {
      const person = await requestController.get(personId);
      person && notificationCenter.emitEntityUpdate(ENTITY.PERSON, [person]);
    }
  }
}

export { PersonController };
