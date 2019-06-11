/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:12
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { SubModuleConfig } from '../types';
import { JuiIconography } from 'jui/foundation/Iconography';

const config: SubModuleConfig = {
  route: {
    path: '/meetings',
    component: () => <div>Meetings</div>,
  },
  nav: async () => ({
    url: '/meetings',
    icon: 'meetings_border',
    Icon: (
      <JuiIconography iconColor={['grey', '900']}>
        meetings_border
      </JuiIconography>
    ),
    IconSelected: <JuiIconography>meetings</JuiIconography>,
    title: 'meeting.Meetings',
    placement: 'top',
  }),
};

export { config };
