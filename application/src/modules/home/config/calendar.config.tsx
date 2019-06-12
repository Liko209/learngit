/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:28:53
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { SubModuleConfig } from '../types';
import { JuiIconography } from 'jui/foundation/Iconography';

const config: SubModuleConfig = {
  route: {
    path: '/calendar',
    component: () => <div>Calendar</div>,
  },
  nav: async () => ({
    url: '/calendar',
    Icon: (
      <JuiIconography iconSize="medium">leftNavEvent_border</JuiIconography>
    ),
    IconSelected: (
      <JuiIconography iconSize="medium">leftNavEvent</JuiIconography>
    ),
    title: 'calendar.Calendar',
    placement: 'bottom',
  }),
};

export { config };
