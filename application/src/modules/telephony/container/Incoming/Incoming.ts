/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { IncomingView } from './Incoming.View';
import { IncomingViewModel } from './Incoming.ViewModel';
import { IncomingProps } from './types';

const Incoming = buildContainer<IncomingProps>({
  View: IncomingView,
  ViewModel: IncomingViewModel,
});

export { Incoming };
Incoming;
