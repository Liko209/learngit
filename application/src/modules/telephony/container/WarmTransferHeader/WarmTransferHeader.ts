/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-28 02:17:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { WarmTransferHeaderView } from './WarmTransferHeader.View';
import { WarmTransferHeaderViewModel } from './WarmTransferHeader.ViewModel';
import { Props } from './types';

const WarmTransferHeader = buildContainer<Props>({
  View: WarmTransferHeaderView,
  ViewModel: WarmTransferHeaderViewModel,
});

export { WarmTransferHeader, Props };
