/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:31:37
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { container } from 'framework/ioc';
import { MessageUmi } from '../container/MessageUmi';
import { SubModuleConfig } from '../types';
import { JuiIconography } from 'jui/foundation/Iconography';
import { lazyComponent } from '@/modules/common/util/lazyComponent';
import { IMessageService } from '@/modules/message/interface/IMessageService';

function getNavUrl() {
  return container.get<IMessageService>(IMessageService.toString()).getNavUrl();
}

const config: SubModuleConfig = {
  route: {
    path: '/messages',
    cache: true,
    render: lazyComponent({
      loader: () =>
        import(/*
        webpackChunkName: "c.message" */ './lazy/Message'),
    }),
  },
  nav: async () => ({
    url: getNavUrl,
    Icon: (
      <JuiIconography iconColor={['grey', '900']}>
        messages_border
      </JuiIconography>
    ),
    IconSelected: <JuiIconography>messages</JuiIconography>,
    title: 'message.Messages',
    umi: <MessageUmi />,
    placement: 'top',
  }),
  moduleConfigLoader: () =>
    import(/*
    webpackChunkName: "m.message" */ '@/modules/message'),
};

export { config };
