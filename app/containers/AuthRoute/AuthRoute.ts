/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { AuthRouteView } from './AuthRoute.View';
import { AuthRouteViewModel } from './AuthRoute.ViewModel';

const Avatar = buildContainer({
  ViewModel: AuthRouteViewModel,
  View: AuthRouteView,
});

export { Avatar };
