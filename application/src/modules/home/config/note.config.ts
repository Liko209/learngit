import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  nav: () => ({
    url: '/notes',
    icon: 'library_books',
    title: t('Notes'),
    placement: 'bottom',
  }),
};

export { config };
