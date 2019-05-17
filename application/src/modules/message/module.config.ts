/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:20:22
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig, Jupiter } from 'framework';
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
  binding: (jupiter: Jupiter) => {
    jupiter.registerClass(MessageStore);
    jupiter.registerService(MESSAGE_SERVICE, MessageService);
    jupiter.registerService(
      MESSAGE_NOTIFICATION_MANAGER,
      MessageNotificationManager,
    );
  },
};

export { config };
