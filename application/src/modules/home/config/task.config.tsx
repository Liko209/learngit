/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:49
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18next from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/tasks',
    component: () => <div>Tasks</div>,
  },
  nav: () => ({
    url: '/tasks',
    icon: 'leftNavTask_border',
    title: i18next.t('item.tasks'),
    placement: 'bottom',
  }),
};

export { config };
