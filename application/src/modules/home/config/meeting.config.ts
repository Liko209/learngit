/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:12
 * Copyright © RingCentral. All rights reserved.
 */
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
