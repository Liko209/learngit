import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  nav: () => ({
    url: '/contacts',
    icon: 'contacts',
    title: t('Contacts'),
    placement: 'bottom',
  }),
};

export { config };
