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
  FuzzySearchPhoneContactOptions,
} from '../entity';
import { SearchUserConfig } from '../config/SearchUserConfig';
import { Person } from 'sdk/module/person/entity';
import { SortableModel, IdModel } from 'sdk/framework/model';
import { Group, FuzzySearchGroupOptions } from 'sdk/module/group/entity';
import { UndefinedAble } from 'sdk/types';
import { MatchedInfo } from '../controller/SearchPersonController';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';
import { Terms, FormattedTerms } from 'sdk/framework/search';

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
    options: FuzzySearchPhoneContactOptions,
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

  doFuzzySearchPersonsAndGroups(
    searchKey: UndefinedAble<string>,
    contactOptions: FuzzySearchContactOptions,
    groupOptions: FuzzySearchGroupOptions,
    sortFunc?: (
      lsh: SortableModel<IdModel>,
      rsh: SortableModel<IdModel>,
    ) => number,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<IdModel>[];
  }>;

  generateMatchedInfo(
    personId: number,
    name: string,
    phoneNumbers: PhoneNumber[],
    terms: Terms,
  ): MatchedInfo;

  generateFormattedTerms: (originalTerms: string[]) => FormattedTerms;
}

export { ISearchService };
