/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/dashboard',
    component: () => <div>Dashboard</div>,
  },
  nav: () => ({
    url: '/dashboard',
    icon: 'dashboard',
    title: t('Dashboard'),
    placement: 'top',
  }),
};

export { config };
