/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework/types';
import { NotificationModule } from './notificationModule';
import { NotificationService } from './service';
import {
  INotificationService,
  INotificationSettingManager,
  INotificationPermission,
  ISoundNotification,
} from './interface';
import { NotificationSettingManager } from './notificationSettingManager/notificationSettingManager';
import { Permission } from './Permission';
import { SoundNotification } from './agent/SoundNotification';

const config: ModuleConfig = {
  entry: NotificationModule,
  provides: [
    { name: INotificationService, value: NotificationService },
    { name: INotificationSettingManager, value: NotificationSettingManager },
    { name: INotificationPermission, value: Permission },
    { name: ISoundNotification, value: SoundNotification },
  ],
};

export { config };
