import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  nav: () => ({
    url: '/files',
    icon: 'files',
    title: t('Files'),
    placement: 'bottom',
  }),
};

export { config };
