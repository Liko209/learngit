/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:47:13
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ItemListViewModel } from './ItemList.ViewModel';
import { ItemListView } from './ItemList.View';
import { ItemListProps } from './types';

const ItemList = buildContainer<ItemListProps>({
  View: ItemListView,
  ViewModel: ItemListViewModel,
});

export { ItemList };
