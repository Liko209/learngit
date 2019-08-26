/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 09:08:57
 * Copyright © RingCentral. All rights reserved.
 */

import {
  RecentSearchTypes,
  RecentSearchModel,
  FuzzySearchContactOptions,
  PhoneContactEntity,
} from '../entity';
import { SearchUserConfig } from '../config/SearchUserConfig';
import { Person } from 'sdk/module/person/entity';
import { SortableModel } from 'sdk/framework/model';
import { Group, FuzzySearchGroupOptions } from 'sdk/module/group/entity';
import { UndefinedAble } from 'sdk/types';

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
    searchKey: UndefinedAble<string>,
    options: FuzzySearchContactOptions,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Person>[];
  }>;

  doFuzzySearchPhoneContacts(
    searchKey: UndefinedAble<string>,
    options: FuzzySearchContactOptions,
  ): Promise<{
    terms: string[];
    phoneContacts: PhoneContactEntity[];
  }>;

  doFuzzySearchAllGroups(
    searchKey: UndefinedAble<string>,
    option: FuzzySearchGroupOptions,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  }>;
}

export { ISearchService };
