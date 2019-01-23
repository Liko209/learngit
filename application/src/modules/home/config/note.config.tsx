/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:28
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/notes',
    component: () => <div>Notes</div>,
  },
  nav: () => ({
    url: '/notes',
    icon: 'notes',
    title: t('Notes'),
    placement: 'bottom',
  }),
};

export { config };
