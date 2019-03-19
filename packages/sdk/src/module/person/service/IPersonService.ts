/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-21 17:18:00
 * Copyright © RingCentral. All rights reserved.
 */

import { SortableModel, Raw } from '../../../framework/model';
import { FEATURE_STATUS, FEATURE_TYPE } from '../../group/entity';

import {
  Person,
  PhoneNumberModel,
  SanitizedExtensionModel,
  PhoneNumberInfo,
  HeadShotModel,
} from '../entity';

import { ContactType } from '../types';

interface IPersonService {
  handleIncomingData(persons: Raw<Person>[]): Promise<void>;

  getPersonsByIds(ids: number[]): Promise<Person[]>;

  getAllCount(): Promise<number>;

  getHeadShotWithSize(
    uid: number,
    headshot_version: string,
    headshot: HeadShotModel,
    size: number,
  ): string | null;

  buildPersonFeatureMap(
    personId: number,
  ): Promise<Map<FEATURE_TYPE, FEATURE_STATUS>>;

  doFuzzySearchPersons(
    searchKey?: string,
    excludeSelf?: boolean,
    arrangeIds?: number[],
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Person>[];
  } | null>;

  getName(person: Person): string;

  getEmailAsName(person: Person): string;

  getFullName(person: Person): string;

  getAvailablePhoneNumbers(
    companyId: number,
    phoneNumbersData?: PhoneNumberModel[],
    extensionData?: SanitizedExtensionModel,
  ): PhoneNumberInfo[];

  matchContactByPhoneNumber(
    e164PhoneNumber: string,
    contactType: ContactType,
  ): Promise<Person | null>;
  refreshPersonData(personId: number): Promise<void>;
}

export { IPersonService };
