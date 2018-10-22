/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-16 15:01:42
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { BackNForwardView } from './BackNForward.View';
import { BackNForwardViewModel } from './BackNForward.ViewModel';

const BackNForward = buildContainer({
  ViewModel: BackNForwardViewModel,
  View: BackNForwardView,
});

export { BackNForward };
