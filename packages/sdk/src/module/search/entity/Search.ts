/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 09:01:10
 * Copyright © RingCentral. All rights reserved.
 */

import { Person } from 'sdk/module/person/entity';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';
import { SortableModel } from 'sdk/framework/model';

enum RecentSearchTypes {
  TEAM = 'team',
  GROUP = 'group',
  PEOPLE = 'people',
  SEARCH = 'search',
}

type RecentSearchModel = {
  id: number;
  type: RecentSearchTypes;
  value: string | number;
  query_params: {};
  time_stamp: number;
};

type FuzzySearchContactOptions = {
  excludeSelf?: boolean;
  arrangeIds?: number[];
  fetchAllIfSearchKeyEmpty?: boolean;
  asIdsOrder?: boolean;
  recentFirst?: boolean;
  ignoreEmail?: boolean;
  meFirst?: boolean;
  sortFunc?: (
    personA: SortableModel<Person>,
    personB: SortableModel<Person>,
  ) => number;
};

type FuzzySearchPhoneContactOptions = FuzzySearchContactOptions & {
  showExtensionOnly?: boolean;
}

type PhoneContactEntity = {
  id: string;
  person: Person;
  phoneNumber: PhoneNumber;
};

enum PersonSortingOrder {
  EmailMatching = 0,
  FullNameMatching = 1,
  LastNameMatching = 2,
  FirstNameMatching = 3,
}

export {
  RecentSearchModel,
  RecentSearchTypes,
  FuzzySearchContactOptions,
  FuzzySearchPhoneContactOptions,
  PersonSortingOrder,
  PhoneContactEntity,
};
