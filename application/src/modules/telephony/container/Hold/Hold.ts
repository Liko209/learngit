/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { HoldView } from './Hold.View';
import { HoldViewModel } from './Hold.ViewModel';
import { HoldProps } from './types';

const Hold = buildContainer<HoldProps>({
  View: HoldView,
  ViewModel: HoldViewModel,
});

export { Hold };
