/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:07:02
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ActionsView } from './Actions.View';
import { ActionsViewModel } from './Actions.ViewModel';
import { ActionsProps } from './types';

const Actions = buildContainer<ActionsProps>({
  View: ActionsView,
  ViewModel: ActionsViewModel,
});

export { Actions };
