/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:29:34
 * Copyright © RingCentral. All rights reserved.
 */
import { ROUTE_ROOT_PATH } from '@/modules/phone/container/LeftRail/constant';
import { lazyComponent } from '@/modules/common/util/lazyComponent';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: ROUTE_ROOT_PATH,
    component: lazyComponent({
      loader: () =>
        import(/*
        webpackChunkName: "c.telephony" */ './lazy/Telephony'),
    }),
  },
  moduleConfigLoader: () =>
    import(/*
    webpackChunkName: "m.telephony" */ '@/modules/telephony'),
};

export { config };
