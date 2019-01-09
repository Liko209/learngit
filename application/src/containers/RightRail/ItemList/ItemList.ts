/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ItemListView } from './ItemList.View';
import { ItemListViewModel } from './ItemList.ViewModel';
import { Props } from './types';

const ItemList = buildContainer<Props>({
  View: ItemListView,
  ViewModel: ItemListViewModel,
});

export { ItemList, Props };
