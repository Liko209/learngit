/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:31:37
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { MessageUmi } from '../container/MessageUmi';
import { SubModuleConfig } from '../types';
import { JuiIconography } from 'jui/foundation/Iconography';
import { lazyComponent } from '@/modules/common/util/lazyComponent';

const config: SubModuleConfig = {
  route: {
    path: '/messages',
    component: lazyComponent({
      loader: () =>
        import(/*
        webpackChunkName: "c.message" */ './lazy/Message'),
    }),
  },
  nav: async () => {
    return {
      url: '/messages',
      Icon: (
        <JuiIconography iconColor={['grey', '900']}>
          messages_border
        </JuiIconography>
      ),
      IconSelected: <JuiIconography>messages</JuiIconography>,
      title: 'message.Messages',
      umi: <MessageUmi />,
      placement: 'top',
    };
  },
  moduleConfigLoader: () =>
    import(/*
    webpackChunkName: "m.message" */ '@/modules/message'),
};

export { config };
