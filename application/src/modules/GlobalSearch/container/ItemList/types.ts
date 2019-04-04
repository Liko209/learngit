/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:48:53
 * Copyright © RingCentral. All rights reserved.
 */
import { RecentSearchModel, RecentSearchTypes } from 'sdk/module/search/entity';
import { IndexRange } from 'jui/components/VirtualizedList/types';
import { Group } from 'sdk/module/group/entity';
import { TAB_TYPE } from '../../types';

type ItemListProps = {
  list: number[];
  type: RecentSearchTypes;
};

type ItemListViewProps = {
  _listRef: any;
  startIndex: number,
  stopIndex: number,
  onKeyUp: () => void;
  setRangeIndex: (range: IndexRange) => void;
  onKeyDown: (list: number[]) => void;
  onEnter: (e: KeyboardEvent, list: number[], type: RecentSearchTypes) => void;
  selectIndex: number;
  resetSelectIndex: () => void;
  setSelectIndex: (index: number) => void;
  selectIndexChange: (index: number) => void;
};

export { ItemListProps, ItemListViewProps, RecentSearchModel, Group, TAB_TYPE, RecentSearchTypes };
