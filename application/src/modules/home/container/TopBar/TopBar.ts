/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { TopBarView } from './TopBar.View';
import { TopBarViewModel } from './TopBar.ViewModel';

const TopBar = buildContainer({
  ViewModel: TopBarViewModel,
  View: TopBarView,
});

export { TopBar };
