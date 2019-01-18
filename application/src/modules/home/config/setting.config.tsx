/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/settings',
    component: () => <div>Settings</div>,
  },
  nav: () => ({
    url: '/settings',
    icon: 'settings',
    title: t('Settings'),
    placement: 'bottom',
  }),
};

export { config };
