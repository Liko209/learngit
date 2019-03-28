/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18nT from '@/utils/i18nT';
import { SubModuleConfig } from '../types';
import { JuiIconography } from 'jui/foundation/Iconography';

const config: SubModuleConfig = {
  route: {
    path: '/settings',
    component: () => <div>Settings</div>,
  },
  nav: async () => ({
    url: '/settings',
    Icon: <JuiIconography iconSize="medium">settings_border</JuiIconography>,
    IconSelected: <JuiIconography iconSize="medium">settings</JuiIconography>,
    title: await i18nT('setting.Settings'),
    placement: 'bottom',
  }),
};

export { config };
