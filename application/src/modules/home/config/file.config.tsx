/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:09
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/files',
    component: () => <div>Files</div>,
  },
  nav: () => ({
    url: '/files',
    icon: 'files',
    title: t('Files'),
    placement: 'bottom',
  }),
};

export { config };
