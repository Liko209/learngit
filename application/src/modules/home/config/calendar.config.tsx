/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:28:53
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18next from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/calendar',
    component: () => <div>Calendar</div>,
  },
  nav: () => ({
    url: '/calendar',
    icon: 'leftNavEvent_border',
    title: i18next.t('calendar.Calendar'),
    placement: 'bottom',
  }),
};

export { config };
