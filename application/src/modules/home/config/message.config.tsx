/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:31:37
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18nT from '@/utils/i18nT';
// import { container } from 'framework';
// import { MessageService } from '@/modules/message/service/MessageService';
// import { Call } from '@/modules/telephony/container';
import { MessageUmi } from '../container/MessageUmi';
// import Message from './lazy/Message';
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
      title: await i18nT('message.Messages'),
      umi: <MessageUmi />,
      placement: 'top',
    };
  },
  loader: () =>
    import(/*
    webpackChunkName: "m.message" */ '@/modules/message'),
};

export { config };
