/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-03 18:03:24
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ForwardBtnView } from './ForwardBtn.View';
import { ForwardBtnViewModel } from './ForwardBtn.ViewModel';
import { Props } from './types';

const ForwardBtn = buildContainer<Props>({
  View: ForwardBtnView,
  ViewModel: ForwardBtnViewModel,
});

export { ForwardBtn, Props };
