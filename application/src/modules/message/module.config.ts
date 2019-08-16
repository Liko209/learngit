/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:20:22
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework/types';
import {
  IMessageStore,
  IMessageService,
  IMessageNotificationManager,
  IMessageSettingManager,
} from './interface';
import { MessageService } from './service';
import { MessageStore } from './store';
import { MessageModule } from './MessageModule';
import { MessageNotificationManager } from './MessageNotificationManager';
import { MessageSettingManager } from './MessageSettingManager';

const config: ModuleConfig = {
  entry: MessageModule,
  provides: [
    {
      name: IMessageStore,
      value: MessageStore,
    },
    {
      name: IMessageService,
      value: MessageService,
    },
    {
      name: IMessageNotificationManager,
      value: MessageNotificationManager,
    },
    {
      name: IMessageSettingManager,
      value: MessageSettingManager,
    },
  ],
};

export { config };
