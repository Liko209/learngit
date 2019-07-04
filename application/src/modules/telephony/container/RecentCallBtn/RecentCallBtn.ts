/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-26 16:00:47
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { RecentCallBtnView } from './RecentCallBtn.View';
import { RecentCallBtnViewModel } from './RecentCallBtn.ViewModel';
import { Props } from './types';

const RecentCallBtn = buildContainer<Props>({
  View: RecentCallBtnView,
  ViewModel: RecentCallBtnViewModel,
});

export { RecentCallBtn, Props };
