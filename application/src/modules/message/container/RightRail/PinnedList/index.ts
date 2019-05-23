/*
 * @Author: isaac.liu
 * @Date: 2019-02-02 13:51:53
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { PinnedListView } from './PinnedList.View';
import { PinnedListViewModel } from './PinnedList.ViewModel';
import { PinnedListProps } from './types';

const PinnedList = buildContainer<PinnedListProps>({
  View: PinnedListView,
  ViewModel: PinnedListViewModel,
});

export { PinnedList, PinnedListProps };
