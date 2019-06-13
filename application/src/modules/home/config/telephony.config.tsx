/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:34
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { PhoneUMI } from '@/modules/phone/container/PhoneUMI';
import { lazyComponent } from '@/modules/common/util/lazyComponent';
import { SubModuleConfig } from '../types';
import { JuiIconography } from 'jui/foundation/Iconography';
import { container } from 'framework';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';

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
    title: 'telephony.Phone',
    umi: <PhoneUMI />,
    placement: 'top',
    disable: !(await container.get(FeaturesFlagsService).canUseTelephony()),
  }),
  moduleConfigLoader: () =>
    import(/*
    webpackChunkName: "m.telephony" */ '@/modules/telephony'),
};

export { config };
