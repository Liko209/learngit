/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-20 15:03:37
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
