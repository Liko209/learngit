/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MoreHorizView } from './MoreHoriz.View';
import { MoreHorizViewModel } from './MoreHoriz.ViewModel';

const MoreHorizIcon = buildContainer({
  View: MoreHorizView,
  ViewModel: MoreHorizViewModel,
});

export { MoreHorizIcon };
