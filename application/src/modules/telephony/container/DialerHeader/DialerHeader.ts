/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 15:42:14
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { DialerHeaderView } from './DialerHeader.View';
import { DialerHeaderViewModel } from './DialerHeader.ViewModel';
import { DialerHeaderProps } from './types';

const DialerHeader = buildContainer<DialerHeaderProps>({
  View: DialerHeaderView,
  ViewModel: DialerHeaderViewModel,
});

export { DialerHeader };
