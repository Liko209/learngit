/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-01 16:23:17
 * Copyright © RingCentral. All rights reserved.
 */
import { PersonItem, GroupItem } from './SearchItem';
import { RecentSearchTypes } from 'sdk/module/search/entity';

const SearchSectionsConfig = {
  [RecentSearchTypes.PEOPLE]: {
    title: 'People',
    SearchItem: PersonItem,
  },
  [RecentSearchTypes.GROUP]: {
    title: 'Groups',
    SearchItem: GroupItem,
  },
  [RecentSearchTypes.TEAM]: {
    title: 'Teams',
    SearchItem: GroupItem,
  },
};

export { SearchSectionsConfig };
