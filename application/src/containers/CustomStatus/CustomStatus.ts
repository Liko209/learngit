/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-08-15 10:13:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import portalManager from '@/common/PortalManager';
import { CustomStatusView } from './CustomStatus.View';
import { CustomStatusViewModel } from './CustomStatus.ViewModel';
import { Props } from './types';

const CustomStatusContainer = buildContainer<Props>({
  View: CustomStatusView,
  ViewModel: CustomStatusViewModel,
});

const CustomStatus = portalManager.wrapper(CustomStatusContainer);
export { CustomStatus, Props };
