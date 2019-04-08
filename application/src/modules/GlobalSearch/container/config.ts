/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-01 16:23:17
 * Copyright © RingCentral. All rights reserved.
 */
import { RecentSearchTypes } from 'sdk/module/search/entity';
import { PersonItem, GroupItem, ContentItem } from './SearchItem';

const SearchSectionsConfig = {
  [RecentSearchTypes.SEARCH]: {
    title: 'globalSearch.contentSearch',
    Item: ContentItem,
  },
  [RecentSearchTypes.PEOPLE]: {
    title: 'globalSearch.People',
    Item: PersonItem,
  },
  [RecentSearchTypes.GROUP]: {
    title: 'globalSearch.Groups',
    Item: GroupItem,
  },
  [RecentSearchTypes.TEAM]: {
    title: 'globalSearch.Teams',
    Item: GroupItem,
  },
};

export { SearchSectionsConfig };
