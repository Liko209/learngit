/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:31:17
 * Copyright © RingCentral. All rights reserved.
 */
import { Person, Group, SortableModel } from 'sdk/src/models'; // eslint-disable-line

type Props = {};

type SearchSection<T> = {
  sortableModel: SortableModel<T>[];
  hasMore: boolean;
};

type SearchResult = {
  terms: string[];
  persons: SearchSection<Person>;
  groups: SearchSection<Group>;
  teams: SearchSection<Group>;
};

type ViewProps = {
  search: (key: string) => SearchResult;
  searchValue: string;
  setValue: (value: string) => void;
  currentUserId: number;
  goToConversation: (id: number) => void;
};

type SectionTypes = SectionType<Person> | SectionType<Group>;

type SectionType<T> = {
  terms: string[];
  sortableModels: SortableModel<T>[];
} | null;

export {
  Props,
  ViewProps,
  SectionTypes,
  SectionType,
  SearchSection,
  SearchResult,
  SortableModel,
  Person,
  Group,
};
