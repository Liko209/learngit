/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MoreView } from './More.View';
import { MoreViewModel } from './More.ViewModel';
import { MoreProps } from './types';

const More = buildContainer<MoreProps>({
  View: MoreView,
  ViewModel: MoreViewModel,
});

export { More, MoreProps };
