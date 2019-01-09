/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:28:53
 * Copyright © RingCentral. All rights reserved.
 */
import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  nav: () => ({
    url: '/calendar',
    icon: 'calendar',
    title: t('Calendar'),
    placement: 'bottom',
  }),
};

export { config };
