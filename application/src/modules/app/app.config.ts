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
