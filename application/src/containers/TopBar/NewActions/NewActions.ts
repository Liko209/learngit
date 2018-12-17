/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:29:47
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { NewActionsView } from './NewActions.View';
import { NewActionsViewModel } from './NewActions.ViewModel';
import { Props } from './types';

const NewActions = buildContainer<Props>({
  View: NewActionsView,
  ViewModel: NewActionsViewModel,
});

export { NewActions, Props };
