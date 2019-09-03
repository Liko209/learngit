/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-21 17:18:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Raw } from '../../../framework/model';
import { FEATURE_STATUS, FEATURE_TYPE } from '../../group/entity';

import {
  Person,
  PhoneNumberModel,
  SanitizedExtensionModel,
  PhoneNumberInfo,
  HeadShotModel,
} from '../entity';

import { ContactType, EditablePersonInfo, HeadShotInfo } from '../types';
import { SYNC_SOURCE } from '../../sync/types';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';

interface IPersonService {
  handleIncomingData(
    persons: Raw<Person>[],
    source: SYNC_SOURCE,
  ): Promise<void>;

  getPersonsByIds(ids: number[]): Promise<Person[]>;

  getCurrentPerson(): Promise<Person | null>;

  getAllCount(): Promise<number>;

  getHeadShotWithSize(
    uid: number,
    headshot: HeadShotModel,
    size: number,
    headshotVersion?: number,
  ): string | null;

  buildPersonFeatureMap(
    personId: number,
  ): Promise<Map<FEATURE_TYPE, FEATURE_STATUS>>;

  getName(person: Person): string;

  getFirstName(person: Person): string;

  getLastName(person: Person): string;

  getEmailAsName(person: Person): string;

  getFullName(person: Person): string;

  getAvailablePhoneNumbers(
    companyId: number,
    phoneNumbersData?: PhoneNumberModel[],
    extensionData?: SanitizedExtensionModel,
  ): PhoneNumberInfo[];

  matchContactByPhoneNumber(
    phoneNumber: string,
    contactType: ContactType,
  ): Promise<Person | null>;
  refreshPersonData(personId: number): Promise<void>;

  isVisiblePerson(person: Person): boolean;

  getSoundexById(id: number): string[];

  isValidPerson(person: Person): boolean;

  getPhoneNumbers(
    person: Person,
    eachPhoneNumber: (phoneNumber: PhoneNumber) => void,
  ): void;

  editPersonalInfo(
    basicInfo?: EditablePersonInfo,
    headshotInfo?: HeadShotInfo,
  ): Promise<void>;
}

export { IPersonService };
