/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:22:04
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
