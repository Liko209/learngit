/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:20:22
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework';
import {
  MESSAGE_NOTIFICATION_MANAGER,
  MESSAGE_SERVICE,
} from './interface/constant';
import { MessageService } from './service';
import { MessageStore } from './store';
import { MessageModule } from './MessageModule';
import { MessageNotificationManager } from './MessageNotificationManager';

const config: ModuleConfig = {
  entry: MessageModule,
  provides: [
    MessageStore,
    {
      name: MESSAGE_SERVICE,
      value: MessageService,
    },
    {
      name: MESSAGE_NOTIFICATION_MANAGER,
      value: MessageNotificationManager,
    },
  ],
};

export { config };
