/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 13:42:24
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { AllCallsView } from './AllCalls.View';
import { AllCallsViewModel } from './AllCalls.ViewModel';
import { AllCallsProps } from './types';

const AllCalls = buildContainer<AllCallsProps>({
  View: AllCallsView,
  ViewModel: AllCallsViewModel,
});

export { AllCalls };
