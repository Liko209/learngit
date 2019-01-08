import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  nav: () => ({
    url: '/tasks',
    icon: 'tasks',
    title: t('Tasks'),
    placement: 'bottom',
  }),
};

export { config };
