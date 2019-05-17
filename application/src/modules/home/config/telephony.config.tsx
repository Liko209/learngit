/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:34
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18nT from '@/utils/i18nT';
import { lazyComponent } from '@/modules/common/util/lazyComponent';
import { SubModuleConfig } from '../types';
import { JuiIconography } from 'jui/foundation/Iconography';

const config: SubModuleConfig = {
  route: {
    path: '/phone',
    component: lazyComponent({
      loader: () =>
        import(/*
        webpackChunkName: "c.telephony" */ './lazy/Telephony'),
    }),
  },
  nav: async () => ({
    url: '/phone',
    icon: 'leftNavPhone_border',
    Icon: (
      <JuiIconography iconColor={['grey', '900']}>
        leftNavPhone_border
      </JuiIconography>
    ),
    IconSelected: <JuiIconography>leftNavPhone</JuiIconography>,
    title: await i18nT('telephony.Phone'),
    placement: 'top',
  }),
  moduleConfigLoader: () =>
    import(/*
    webpackChunkName: "m.telephony" */ '@/modules/telephony'),
};

export { config };
