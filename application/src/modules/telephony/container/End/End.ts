/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { EndView } from './End.View';
import { EndViewModel } from './End.ViewModel';
import { EndProps } from './types';

const End = buildContainer<EndProps>({
  View: EndView,
  ViewModel: EndViewModel,
});

export { End };
