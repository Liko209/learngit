/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-25 07:16:52
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ActivityTimerView } from './ActivityTimer.View';
import { ActivityTimerViewModel } from './ActivityTimer.ViewModel';
import { ActivityTimerProps } from './types';

const ActivityTimer = buildContainer<ActivityTimerProps>({
  View: ActivityTimerView,
  ViewModel: ActivityTimerViewModel,
});

export { ActivityTimer };
