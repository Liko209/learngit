/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { TokenRouteView } from './TokenRoute.View';
import { TokenRouteViewModel } from './TokenRoute.ViewModel';

const TokenRoute = buildContainer({
  ViewModel: TokenRouteViewModel,
  View: TokenRouteView,
});

export { TokenRoute };
