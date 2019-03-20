/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:12
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18next from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/meetings',
    component: () => <div>Meetings</div>,
  },
  nav: () => ({
    url: '/meetings',
    icon: 'meetings_border',
    title: i18next.t('meeting.Meetings'),
    placement: 'top',
  }),
};

export { config };
