/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-01 16:23:17
 * Copyright © RingCentral. All rights reserved.
 */
import { SectionTypeMap } from './types';
import { PersonItem, GroupItem } from './SearchItem';

const SearchSectionsConfig = {
  [SectionTypeMap.PEOPLE]: {
    title: 'People',
    SearchItem: PersonItem,
  },
  [SectionTypeMap.GROUPS]: {
    title: 'Groups',
    SearchItem: GroupItem,
  },
  [SectionTypeMap.TEAMS]: {
    title: 'Teams',
    SearchItem: GroupItem,
  },
};

export { SearchSectionsConfig };
