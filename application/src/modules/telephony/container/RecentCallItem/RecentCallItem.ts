/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-27 14:16:31
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { RecentCallItemView } from './RecentCallItem.View';
import { RecentCallItemViewModel } from './RecentCallItem.ViewModel';
import { Props } from './types';

const RecentCallItem = buildContainer<Props>({
  View: RecentCallItemView,
  ViewModel: RecentCallItemViewModel,
});

export { RecentCallItem, Props };
