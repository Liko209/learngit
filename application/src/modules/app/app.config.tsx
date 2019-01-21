/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:25:03
 * Copyright © RingCentral. All rights reserved.
 */
import { lazyComponent } from '@/modules/common/util/lazyComponent';

const Home = lazyComponent({
  loader: () => import(/*
    webpackChunkName: "c.home" */ './lazy/Home'),
});
const UnifiedLogin = lazyComponent({
  loader: () =>
    import(/*
    webpackChunkName: "c.unified-login" */ './lazy/UnifiedLogin'),
});
const VersionInfo = lazyComponent({
  loader: () =>
    import(/*
    webpackChunkName: "c.version-info" */ './lazy/VersionInfo'),
});

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
