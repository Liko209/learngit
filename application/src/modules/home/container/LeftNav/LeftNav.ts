/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-29 18:53:09
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { LeftNavView } from './LeftNav.View';
import { LeftNavViewModel } from './LeftNav.ViewModel';

const LeftNav = buildContainer({
  View: LeftNavView,
  ViewModel: LeftNavViewModel,
});

export { LeftNav };
