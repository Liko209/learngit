/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { CallActionsView } from './CallActions.View';
import { CallActionsViewModel } from './CallActions.ViewModel';
import { CallActionsProps } from './types';

const CallActions = buildContainer<CallActionsProps>({
  View: CallActionsView,
  ViewModel: CallActionsViewModel,
});

export { CallActions };
