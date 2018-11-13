/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:07:02
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ProgressActionsView } from './ProgressActions.View';
import { ProgressActionsViewModel } from './ProgressActions.ViewModel';
import { ProgressActionsProps } from './types';

const ProgressActions = buildContainer<ProgressActionsProps>({
  View: ProgressActionsView,
  ViewModel: ProgressActionsViewModel,
});

export { ProgressActions };
