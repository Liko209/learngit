import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  nav: () => ({
    url: '/notes',
    icon: 'notes',
    title: t('Notes'),
    placement: 'bottom',
  }),
};

export { config };
