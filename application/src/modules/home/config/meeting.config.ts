import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  nav: () => ({
    url: '/meetings',
    icon: 'meetings',
    title: t('Meetings'),
    placement: 'top',
  }),
};

export { config };
