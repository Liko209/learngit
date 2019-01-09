/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:31:37
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import { Umi } from '@/containers/Umi';
import { Message } from '@/modules/message';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/messages/:id?',
    component: Message,
  },
  nav: (currentConversationId: number, groupIds: number[]) => {
    return {
      url: `/messages/${currentConversationId}`,
      icon: 'messages',
      title: t('Messages'),
      umi: <Umi ids={groupIds} global="UMI.app" />,
      placement: 'top',
    };
  },
};

export { config };
