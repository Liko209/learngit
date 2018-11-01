/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 18:11:30
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { TimeNodeDividerView } from './TimeNodeDivider.View';
import { TimeNodeDividerViewModel } from './TimeNodeDivider.ViewModel';
import { TimeNodeDividerProps } from './types';

const TimeNodeDivider = buildContainer<TimeNodeDividerProps>({
  View: TimeNodeDividerView,
  ViewModel: TimeNodeDividerViewModel,
});

export { TimeNodeDivider };
