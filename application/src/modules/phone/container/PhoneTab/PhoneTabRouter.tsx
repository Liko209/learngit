/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-16 18:36:52
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { PhoneTabRouterView } from './PhoneTabRouter.View';
import { PhoneTabRouterViewModel } from './PhoneTabRouter.ViewModel';
import { PhoneTabProps } from './types';

const PhoneTabRouter = buildContainer<PhoneTabProps>({
  View: PhoneTabRouterView,
  ViewModel: PhoneTabRouterViewModel,
});

export { PhoneTabRouter };
