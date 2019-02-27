/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:31:17
 * Copyright © RingCentral. All rights reserved.
 */
import { Person } from 'sdk/module/person/entity';
import { Group } from 'sdk/module/group/entity';
import { SortableModel } from 'sdk/framework/model';
import { RecentSearchModel, RecentSearchTypes } from 'sdk/module/search';

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

type SearchItems = {
  ids: number[];
  name: RecentSearchTypes;
  hasMore: boolean;
};

type Props = {};

type ViewProps = {
  focus: boolean;
  updateFocus: (focus: boolean) => void;
  search: (key: string) => Promise<SearchResult | undefined>;
  setSearchResult: (key: string) => void;
  searchValue: string;
  setValue: (value: string) => void;
  currentUserId: number;
  isTeamOrGroup: (id: number) => boolean;
  getRecent: () => void;
  clearRecent: () => void;
  recentRecord: RecentSearchModel[];
  data: SearchItems[];
  terms: string[];
  selectIndex: number[];
  resetData: () => void;
  resetSelectIndex: () => void;
  setSelectIndex: (section: number, cellIndex: number) => void;
  setData: (data: SearchItems[]) => void;
  findNextValidSectionLength: (section: number, offset: number) => number[];
  onKeyUp: () => void;
  onKeyDown: () => void;
  selectIndexChange: (sectionIndex: number, cellIndex: number) => void;
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
};
