/*
 * @Author: Jeffrey Huang
 * @Date: 2019-05-30 19:16:49
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { FlipView } from './Flip.View';
import { FlipViewModel } from './Flip.ViewModel';
import { FlipProps } from './types';

const Flip = buildContainer<FlipProps>({
  View: FlipView,
  ViewModel: FlipViewModel,
});

export { Flip, FlipProps };
