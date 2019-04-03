/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 15:42:14
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { DialerContainerView } from './DialerContainer.View';
import { DialerContainerViewModel } from './DialerContainer.ViewModel';
import { DialerContainerProps } from './types';

const DialerContainer = buildContainer<DialerContainerProps>({
  View: DialerContainerView,
  ViewModel: DialerContainerViewModel,
});

export { DialerContainer };
