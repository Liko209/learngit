/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MinimizeView } from './Minimize.View';
import { MinimizeViewModel } from './Minimize.ViewModel';
import { MinimizeProps } from './types';

const Minimize = buildContainer<MinimizeProps>({
  View: MinimizeView,
  ViewModel: MinimizeViewModel,
});

export { Minimize };
