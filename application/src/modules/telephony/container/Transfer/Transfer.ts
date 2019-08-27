/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-22 03:46:38
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { TransferView } from './Transfer.View';
import { TransferViewModel } from './Transfer.ViewModel';
import { Props } from './types';

const Transfer = buildContainer<Props>({
  View: TransferView,
  ViewModel: TransferViewModel,
});

export { Transfer, Props };
