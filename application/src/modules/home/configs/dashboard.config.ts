import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  nav: () => ({
    url: '/dashboard',
    icon: 'dashboard',
    title: t('Dashboard'),
    placement: 'top',
  }),
};

export { config };
