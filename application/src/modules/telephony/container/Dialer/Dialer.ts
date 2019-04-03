/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 17:19:54
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { DialerView } from './Dialer.View';
import { DialerViewModel } from './Dialer.ViewModel';
import { DialerProps } from './types';

const Dialer = buildContainer<DialerProps>({
  View: DialerView,
  ViewModel: DialerViewModel,
});

export { Dialer };
