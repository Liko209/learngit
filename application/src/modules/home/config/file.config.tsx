/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:09
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { SubModuleConfig } from '../types';
import { JuiIconography } from 'jui/foundation/Iconography';

const config: SubModuleConfig = {
  route: {
    path: '/files',
    component: () => <div>Files</div>,
  },
  nav: async () => ({
    url: '/files',
    Icon: <JuiIconography iconSize="medium">leftNavFile_border</JuiIconography>,
    IconSelected: (
      <JuiIconography iconSize="medium">leftNavFile</JuiIconography>
    ),
    title: 'item.files',
    placement: 'bottom',
  }),
};

export { config };
