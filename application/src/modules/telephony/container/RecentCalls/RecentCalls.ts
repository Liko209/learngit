/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-26 14:55:18
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { RecentCallsView } from './RecentCalls.View';
import { RecentCallsViewModel } from './RecentCalls.ViewModel';
import { Props } from './types';

const RecentCalls = buildContainer<Props>({
  View: RecentCallsView,
  ViewModel: RecentCallsViewModel,
});

export { RecentCalls, Props };
