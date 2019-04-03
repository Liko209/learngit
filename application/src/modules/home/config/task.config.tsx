/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:49
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18nT from '@/utils/i18nT';
import { SubModuleConfig } from '../types';
import { JuiIconography } from 'jui/foundation/Iconography';

const config: SubModuleConfig = {
  route: {
    path: '/tasks',
    component: () => <div>Tasks</div>,
  },
  nav: async () => ({
    url: '/tasks',
    Icon: <JuiIconography iconSize="medium">leftNavTask_border</JuiIconography>,
    IconSelected: (
      <JuiIconography iconSize="medium">leftNavTask</JuiIconography>
    ),
    title: await i18nT('item.tasks'),
    placement: 'bottom',
  }),
};

export { config };
