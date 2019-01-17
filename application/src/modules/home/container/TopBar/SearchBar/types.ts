/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:31:17
 * Copyright © RingCentral. All rights reserved.
 */
import { Person } from 'sdk/module/person/entity';
import { Group } from 'sdk/module/group/entity';
import { SortableModel } from 'sdk/models';

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

type Props = {};

type ViewProps = {
  search: (key: string) => Promise<SearchResult>;
  searchValue: string;
  setValue: (value: string) => void;
  currentUserId: number;
  isTeamOrGroup: (id: number) => boolean;
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
};
