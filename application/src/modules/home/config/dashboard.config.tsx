/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18next from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/dashboard',
    component: () => <div>Dashboard</div>,
  },
  nav: () => ({
    url: '/dashboard',
    icon: 'dashboard',
    title: i18next.t('dashboard.Dashboard'),
    placement: 'top',
  }),
};

export { config };
