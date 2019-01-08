import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  nav: () => ({
    url: '/phone',
    icon: 'phone',
    title: t('Phone'),
    placement: 'top',
  }),
};

export { config };
