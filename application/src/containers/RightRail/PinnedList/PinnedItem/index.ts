/*
 * @Author: isaac.liu
 * @Date: 2019-02-01 08:41:29
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { PinnedItemView } from './PinnedItem.View';
import { PinnedItemViewModel } from './PinnedItem.ViewModel';
import { PinnedItemProps } from './types';

const PinnedItem = buildContainer<PinnedItemProps>({
  View: PinnedItemView,
  ViewModel: PinnedItemViewModel,
});

export { PinnedItem };
