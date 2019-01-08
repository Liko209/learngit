import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  nav: () => ({
    url: '/calendar',
    icon: 'date_range',
    title: t('Calendar'),
    placement: 'bottom',
  }),
};

export { config };
