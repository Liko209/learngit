/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:31:37
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18next from 'i18next';
import { container } from 'framework';
import { MessageService } from '@/modules/message/service/MessageService';
import { MessageUmi } from '../container/MessageUmi';
import Message from './lazy/Message';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/messages',
    component: Message,
    // component: lazyComponent({
    //   loader: () =>
    //     import(/*
    //     webpackChunkName: "c.message" */ './lazy/Message'),
    // }),
  },
  nav: () => {
    return {
      url: '/messages',
      icon: 'messages',
      title: i18next.t('message.Messages'),
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
