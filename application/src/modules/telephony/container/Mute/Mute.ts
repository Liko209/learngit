/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MuteView } from './Mute.View';
import { MuteViewModel } from './Mute.ViewModel';
import { MuteProps } from './types';

const Mute = buildContainer<MuteProps>({
  View: MuteView,
  ViewModel: MuteViewModel,
});

export { Mute };
