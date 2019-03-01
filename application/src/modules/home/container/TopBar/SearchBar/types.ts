/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:31:17
 * Copyright © RingCentral. All rights reserved.
 */
import { Person } from 'sdk/module/person/entity';
import { Group } from 'sdk/module/group/entity';
import { SortableModel } from 'sdk/framework/model';
import { RecentSearchTypes } from 'sdk/module/search/entity';

type BaseItems<T> = {
  ids: T[];
};

type SearchItems = BaseItems<number> & {
  type: RecentSearchTypes;
  hasMore: boolean;
};

type RecentItems = BaseItems<number | string> & {
  types: RecentSearchTypes[];
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

type Props = {};

type ViewProps = {
  focus: boolean;
  updateFocus: (focus: boolean) => void;
  setSearchResult: (key: string) => void;
  searchValue: string;
  setValue: (value: string) => void;
  currentUserId: number;
  getRecent: () => void;
  clearRecent: () => void;
  addRecentRecord: (id: number) => void;
  searchResult: SearchItems[];
  recentRecord: RecentItems[];
  terms: string[];
  selectIndex: number[];
  resetData: () => void;
  resetSelectIndex: () => void;
  setSelectIndex: (section: number, cellIndex: number) => void;
  onKeyUp: () => void;
  onKeyDown: () => void;
  selectIndexChange: (sectionIndex: number, cellIndex: number) => void;
  getCurrentItemId: () => any;
};

type SectionType<T> = {
  terms: string[];
  sortableModels: SortableModel<T>[];
} | null;

export {
  Props,
  ViewProps,
  SectionType,
  SearchSection,
  SearchResult,
  SortableModel,
  Person,
  Group,
  SearchItems,
  RecentItems,
};
