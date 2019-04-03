/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-01 16:23:17
 * Copyright © RingCentral. All rights reserved.
 */
import { RecentSearchTypes } from 'sdk/module/search/entity';
import { PersonItem, GroupItem } from './SearchItem';

const SearchSectionsConfig = {
  [RecentSearchTypes.PEOPLE]: {
    title: 'globalSearch.People',
    SearchItem: PersonItem,
  },
  [RecentSearchTypes.GROUP]: {
    title: 'globalSearch.Groups',
    SearchItem: GroupItem,
  },
  [RecentSearchTypes.TEAM]: {
    title: 'globalSearch.Teams',
    SearchItem: GroupItem,
  },
};

export { SearchSectionsConfig };
