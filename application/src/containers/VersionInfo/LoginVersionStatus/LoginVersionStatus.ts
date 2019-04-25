/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-09 17:00:02
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { LoginVersionStatusView } from './LoginVersionStatus.View';
import { LoginVersionStatusViewModel } from './LoginVersionStatus.ViewModel';

const LoginVersionStatus = buildContainer({
  View: LoginVersionStatusView,
  ViewModel: LoginVersionStatusViewModel,
});

export { LoginVersionStatus };
