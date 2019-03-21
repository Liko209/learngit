/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:09
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18next from 'i18next';
import { SubModuleConfig } from '../types';
import { JuiIconography } from 'jui/foundation/Iconography';

const config: SubModuleConfig = {
  route: {
    path: '/files',
    component: () => <div>Files</div>,
  },
  nav: () => ({
    url: '/files',
    Icon: <JuiIconography iconSize="medium">leftNavFile_border</JuiIconography>,
    IconSelected: (
      <JuiIconography iconSize="medium">leftNavFile</JuiIconography>
    ),
    title: i18next.t('item.files'),
    placement: 'bottom',
  }),
};

export { config };
