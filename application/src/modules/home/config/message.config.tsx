/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:31:37
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import { container } from 'framework';
import { lazyComponent } from '@/modules/common/util/lazyComponent';
import { MessageService } from '@/modules/message/service/MessageService';
import { MessageUmi } from '../container/MessageUmi';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/messages',
    component: lazyComponent({
      loader: () =>
        import(/*
        webpackChunkName: "c.message" */ './lazy/Message'),
    }),
  },
  nav: () => {
    return {
      url: '/messages',
      icon: 'messages',
      title: t('Messages'),
      umi: <MessageUmi />,
      placement: 'top',
    };
  },
  loader: () =>
    import(/*
    webpackChunkName: "m.message" */ '@/modules/message'),
  afterBootstrap: () => {
    const messageService = container.get(MessageService);
    // Check user permission and register extensions
    messageService.registerExtension({
      'CONVERSATION_PAGE.HEADER.BUTTONS': [], // [TelephonyButton, MeetingButton]
    });
  },
};

export { config };
