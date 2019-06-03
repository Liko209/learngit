/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:48:53
 * Copyright © RingCentral. All rights reserved.
 */
import { Person } from 'sdk/module/person/entity';
import { Group } from 'sdk/module/group/entity';
import { SortableModel } from 'sdk/framework/model';
// import { RecentSearchTypes } from 'sdk/module/search/entity';
import { cacheEventFn } from '../types';
import {
  SEARCH_SCOPE,
  TAB_TYPE,
  SEARCH_VIEW,
  SearchItemTypes,
} from '../../types';

type SearchItems = {
  ids: (number | string)[];
  type: SearchItemTypes;
  hasMore: boolean;
};

type SearchSection<T> = {
  sortableModel: SortableModel<T>[];
  hasMore: boolean;
};

type SearchSections = {
  ids: number[];
  hasMore: boolean;
};

type SearchResult = {
  terms: string[];
  people: SearchSections;
  groups: SearchSections;
  teams: SearchSections;
};

type SectionType<T> = {
  terms: string[];
  sortableModels: SortableModel<T>[];
};

type InstantSearchProps = {};

type InstantSearchViewProps = {
  onKeyUp: () => void;
  onKeyDown: () => void;
  onEnter: (e: KeyboardEvent) => void;
  searchResult: SearchItems[];
  terms: string[];
  selectIndex: number[];
  resetSelectIndex: () => void;
  setSelectIndex: (section: number, cellIndex: number) => void;
  selectIndexChange: (sectionIndex: number, cellIndex: number) => void;
  getSearchScope: (index: number) => void;
  onShowMore: (type: SearchItemTypes) => () => void;
};

export {
  InstantSearchProps,
  InstantSearchViewProps,
  SearchItems,
  SearchSection,
  SearchResult,
  Person,
  Group,
  SectionType,
  SortableModel,
  SEARCH_SCOPE,
  SEARCH_VIEW,
  SearchItemTypes,
  TAB_TYPE,
  cacheEventFn,
};
