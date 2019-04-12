/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { IgnoreView } from './Ignore.View';
import { IgnoreViewModel } from './Ignore.ViewModel';
import { IgnoreProps } from './types';

const Ignore = buildContainer<IgnoreProps>({
  View: IgnoreView,
  ViewModel: IgnoreViewModel,
});

export { Ignore };
