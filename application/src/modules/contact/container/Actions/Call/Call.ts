/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-01 09:46:40
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { CallView } from './Call.View';
import { CallViewModel } from './Call.ViewModel';
import { CallProps } from './types';

const Call = buildContainer<CallProps>({
  View: CallView,
  ViewModel: CallViewModel,
});

export { Call };
