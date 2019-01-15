/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:09
 * Copyright © RingCentral. All rights reserved.
 */
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
