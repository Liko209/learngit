import React from 'react';
import { t } from 'i18next';
import { Umi } from '@/containers/Umi';
import { Message } from '@/modules/message';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/messages',
    component: Message,
  },
  nav: (currentConversationId: number, groupIds: number[]) => {
    return {
      url: `/messages/${currentConversationId}`,
      icon: 'message',
      title: t('Messages'),
      umi: <Umi ids={groupIds} global="UMI.app" />,
      placement: 'top',
    };
  },
};

export { config };
