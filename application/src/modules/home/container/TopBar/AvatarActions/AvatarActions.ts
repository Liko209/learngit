/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:30:30
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { AvatarActionsView } from './AvatarActions.View';
import { AvatarActionsViewModel } from './AvatarActions.ViewModel';
import { Props } from './types';

const AvatarActions = buildContainer<Props>({
  View: AvatarActionsView,
  ViewModel: AvatarActionsViewModel,
});

export { AvatarActions, Props };
