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
  ],
};

export { config };
