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
    automationId: 'content',
  },
  [RecentSearchTypes.PEOPLE]: {
    title: 'globalSearch.People',
    Item: PersonItem,
    automationId: 'people',
  },
  [RecentSearchTypes.GROUP]: {
    title: 'globalSearch.Groups',
    Item: GroupItem,
    automationId: 'groups',
  },
  [RecentSearchTypes.TEAM]: {
    title: 'globalSearch.teams',
    Item: GroupItem,
    automationId: 'teams',
  },
};

export { SearchSectionsConfig };
