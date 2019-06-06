/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 09:08:57
 * Copyright © RingCentral. All rights reserved.
 */

import {
  RecentSearchTypes,
  RecentSearchModel,
  FuzzySearchPersonOptions,
  PhoneContactEntity,
} from '../entity';
import { SearchUserConfig } from '../config/SearchUserConfig';
import { Person } from 'sdk/module/person/entity';
import { SortableModel } from 'sdk/framework/model';
interface ISearchService {
  addRecentSearchRecord(
    type: RecentSearchTypes,
    value: string | number,
    params: {},
  ): Promise<void>;
  clearRecentSearchRecords(): Promise<void>;
  getRecentSearchRecords(): Promise<RecentSearchModel[]>;
  removeRecentSearchRecords(ids: Set<number>): Promise<void>;
  getRecentSearchRecordsByType(
    type: RecentSearchTypes,
  ): Promise<Map<number | string, RecentSearchModel>>;

  userConfig: SearchUserConfig;

  doFuzzySearchPersons(
    options: FuzzySearchPersonOptions,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Person>[];
  }>;

  doFuzzySearchPhoneContacts(
    options: FuzzySearchPersonOptions,
  ): Promise<{
    terms: string[];
    phoneContacts: PhoneContactEntity[];
  }>;
}

export { ISearchService };
