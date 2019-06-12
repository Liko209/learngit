/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { SubModuleConfig } from '../types';
import { JuiIconography } from 'jui/foundation/Iconography';

const config: SubModuleConfig = {
  route: {
    path: '/dashboard',
    component: () => <div>Dashboard</div>,
  },
  nav: async () => ({
    url: '/dashboard',
    Icon: (
      <JuiIconography iconColor={['grey', '900']}>
        dashboard_border
      </JuiIconography>
    ),
    IconSelected: <JuiIconography>dashboard</JuiIconography>,
    title: 'dashboard.Dashboard',
    placement: 'top',
  }),
};

export { config };
