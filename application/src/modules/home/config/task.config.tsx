/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:49
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18next from 'i18next';
import { SubModuleConfig } from '../types';
import { JuiIconography } from 'jui/foundation/Iconography';

const config: SubModuleConfig = {
  route: {
    path: '/tasks',
    component: () => <div>Tasks</div>,
  },
  nav: () => ({
    url: '/tasks',
    Icon: <JuiIconography iconSize="medium">leftNavTask_border</JuiIconography>,
    IconSelected: (
      <JuiIconography iconSize="medium">leftNavTask</JuiIconography>
    ),
    title: i18next.t('item.tasks'),
    placement: 'bottom',
  }),
};

export { config };
