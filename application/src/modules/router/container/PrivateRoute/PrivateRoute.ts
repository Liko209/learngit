/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { PrivateRouteView } from './PrivateRoute.View';
import { PrivateRouteViewModel } from './PrivateRoute.ViewModel';
import { PrivateRouteProps } from './types';

const PrivateRoute = buildContainer<PrivateRouteProps>({
  ViewModel: PrivateRouteViewModel,
  View: PrivateRouteView,
});

export { PrivateRoute };
