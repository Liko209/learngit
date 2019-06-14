/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:28
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { SubModuleConfig } from '../types';
import { JuiIconography } from 'jui/foundation/Iconography';

const config: SubModuleConfig = {
  route: {
    path: '/notes',
    component: () => <div>Notes</div>,
  },
  nav: async () => ({
    url: '/notes',
    Icon: <JuiIconography iconSize="medium">leftNavNote_border</JuiIconography>,
    IconSelected: (
      <JuiIconography iconSize="medium">leftNavNote</JuiIconography>
    ),
    title: 'item.notes',
    placement: 'bottom',
  }),
};

export { config };
