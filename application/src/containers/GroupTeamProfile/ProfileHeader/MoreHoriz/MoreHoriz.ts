/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MoreHorizView } from './MoreHoriz.View';
import { MoreHorizViewModel } from './MoreHoriz.ViewModel';
import { MoreHorizProps } from './types';

const MoreHorizIcon = buildContainer<MoreHorizProps>({
  View: MoreHorizView,
  ViewModel: MoreHorizViewModel,
});

export { MoreHorizIcon };
