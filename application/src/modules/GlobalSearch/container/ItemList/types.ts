/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:48:53
 * Copyright © RingCentral. All rights reserved.
 */
import { RecentSearchModel } from 'sdk/module/search/entity';
import { IndexRange } from 'jui/components/VirtualizedList/types';
import { Group } from 'sdk/module/group/entity';
import { FetchSortableDataListHandler } from '@/store/base';

import { TAB_TYPE, SearchItemTypes } from '../../types';
import { Person } from '../InstantSearch/types';

type ItemListProps = {
  ids: number[];
  type: SearchItemTypes;
};

type ItemListViewProps = {
  ids: number[];
  type: SearchItemTypes;
  startIndex: number;
  stopIndex: number;
  onKeyUp: () => void;
  setRangeIndex: (range: IndexRange) => void;
  onKeyDown: (list: number[]) => void;
  onEnter: (e: KeyboardEvent, list: number[], type: SearchItemTypes) => void;
  selectIndex: number;
  resetSelectIndex: () => void;
  setSelectIndex: (index: number) => void;
  selectIndexChange: (index: number) => void;
  listHandler:
  | FetchSortableDataListHandler<Person, number>
  | FetchSortableDataListHandler<Group, number>;
};

export {
  ItemListProps,
  ItemListViewProps,
  RecentSearchModel,
  Group,
  TAB_TYPE,
  SearchItemTypes,
};
