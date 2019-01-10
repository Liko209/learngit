/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:31:37
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import { Message } from '@/modules/message';
import { MessageUmi } from '../container/MessageUmi';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/messages',
    component: Message,
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
};

export { config };
