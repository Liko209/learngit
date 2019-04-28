/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-02-27 10:46:49
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { PinView } from './Pin.View';
import { PinViewModel } from './Pin.ViewModel';
import { PinProps } from './types';

const Pin = buildContainer<PinProps>({
  View: PinView,
  ViewModel: PinViewModel,
});

export { Pin, PinProps };
