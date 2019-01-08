import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  nav: () => ({
    url: '/settings',
    icon: 'settings',
    title: t('Settings'),
    placement: 'bottom',
  }),
};

export { config };
