/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 15:42:14
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { DialerTitleBarView } from './DialerTitleBar.View';
import { DetachOrAttachViewModel } from './DialerTitleBar.ViewModel';
import { DialerTitleBarProps } from './types';

const DialerTitleBar = buildContainer<DialerTitleBarProps>({
  View: DialerTitleBarView,
  ViewModel: DetachOrAttachViewModel,
});

export { DialerTitleBar };
