/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-06 13:29:53
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MoreView } from './More.View';
import { MoreViewModel } from './More.ViewModel';
import { Props } from './types';

const More = buildContainer<Props>({
  View: MoreView,
  ViewModel: MoreViewModel,
});

export { More, Props };
