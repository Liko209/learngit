/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-07-26 16:13:25
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { CallSwitchView } from './CallSwitch.View';
import { CallSwitchViewModel } from './CallSwitch.ViewModel';
import { Props } from './types';

const CallSwitch = buildContainer<Props>({
  View: CallSwitchView,
  ViewModel: CallSwitchViewModel,
});

export { CallSwitch, Props };
