/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-03 10:14:06
 * Copyright © RingCentral. All rights reserved.
 */
import { TAB_TYPE, SearchItemTypes } from '../../types';
import { Person } from 'sdk/module/person/entity';
import { Group } from 'sdk/module/group/entity';
import { SortableModel } from 'sdk/framework/model';
import { SectionType } from '../InstantSearch/types';
import { RecentSearchModel } from 'sdk/module/search/entity';

type SearchItems = {
  ids: number[];
  type: SearchItemTypes;
  hasMore: boolean;
};

type ListSearchResultProps = {
  type: TAB_TYPE;
  pageDataTracking?: Function;
  isShow?: boolean;
};

type ListSearchResultViewProps = {
  currentTab: TAB_TYPE;
  search: (type: TAB_TYPE) => Promise<number[]>;
};

export {
  ListSearchResultProps,
  ListSearchResultViewProps,
  TAB_TYPE,
  SortableModel,
  Person,
  Group,
  SectionType,
  SearchItems,
  SearchItemTypes,
  RecentSearchModel,
};
