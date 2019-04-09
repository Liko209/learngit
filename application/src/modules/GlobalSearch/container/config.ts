/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-01 16:23:17
 * Copyright © RingCentral. All rights reserved.
 */
import { PersonItem, GroupItem, ContentItem, MessageItem } from './SearchItem';
import { SearchItemTypes } from '../types';

const SearchSectionsConfig = {
  [SearchItemTypes.CONTENT]: {
    title: 'globalSearch.contentSearch',
    Item: ContentItem,
    automationId: 'content',
  },
  [SearchItemTypes.PEOPLE]: {
    title: 'globalSearch.People',
    Item: PersonItem,
    automationId: 'people',
  },
  [SearchItemTypes.GROUP]: {
    title: 'globalSearch.Groups',
    Item: GroupItem,
    automationId: 'groups',
  },
  [SearchItemTypes.TEAM]: {
    title: 'globalSearch.Teams',
    Item: GroupItem,
    automationId: 'teams',
  },
  [SearchItemTypes.SEARCH]: {
    title: 'globalSearch.Teams',
    Item: MessageItem,
  },
};

export { SearchSectionsConfig };
