/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:49
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/tasks',
    component: () => <div>Tasks</div>,
  },
  nav: () => ({
    url: '/tasks',
    icon: 'tasks',
    title: t('Tasks'),
    placement: 'bottom',
  }),
};

export { config };
