/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:34
 * Copyright © RingCentral. All rights reserved.
 */
import i18next from 'i18next';
import { lazyComponent } from '@/modules/common/util/lazyComponent';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/phone',
    component: lazyComponent({
      loader: () =>
        import(/*
        webpackChunkName: "c.telephony" */ './lazy/Telephony'),
    }),
  },
  nav: () => ({
    url: '/phone',
    icon: 'leftNavPhone_border',
    title: i18next.t('telephony.Phone'),
    placement: 'top',
  }),
  loader: () =>
    import(/*
    webpackChunkName: "m.telephony" */ '@/modules/telephony'),
};

export { config };
