/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 16:12:35
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
