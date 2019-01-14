/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:25:03
 * Copyright © RingCentral. All rights reserved.
 */
import { VersionInfo } from '@/containers/VersionInfo';
import { Home } from '@/modules/home';
import { UnifiedLogin } from '@/modules/login';

const config = {
  routes: [
    {
      path: '/',
      component: Home,
      needAuth: true,
    },
    {
      path: '/unified-login',
      component: UnifiedLogin,
    },
    {
      path: '/commit-info',
      component: VersionInfo,
    },
    {
      path: '/version',
      component: VersionInfo,
    },
  ],
};

export { config };
