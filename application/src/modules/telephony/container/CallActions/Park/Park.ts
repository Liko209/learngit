/*
 * @Author: Peng Yu (peng.yu@ringcentral.com)
 * @Date: 2019-05-29 17:10:31
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ParkView } from './Park.View';
import { ParkViewModel } from './Park.ViewModel';
import { Props } from './types';

const Park = buildContainer<Props>({
  View: ParkView,
  ViewModel: ParkViewModel,
});

export { Park, Props };
