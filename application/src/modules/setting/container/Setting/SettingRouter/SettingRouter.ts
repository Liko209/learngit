/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-05 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { SettingRouterView } from './SettingRouter.View';
import { SettingRouterViewModel } from './SettingRouter.ViewModel';

const SettingRouter = buildContainer({
  View: SettingRouterView,
  ViewModel: SettingRouterViewModel,
});

export { SettingRouter };
