/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework';
import { NotificationModule } from './notificationModule';
import { NotificationService } from './service';
import {
  INotificationService,
  INotificationSettingManager,
  INotificationPermission,
} from './interface';
import { NotificationSettingManager } from './notificationSettingManager/notificationSettingManager';
import { Permission } from './Permission';

const config: ModuleConfig = {
  entry: NotificationModule,
  provides: [
    { name: INotificationService, value: NotificationService },
    { name: INotificationSettingManager, value: NotificationSettingManager },
    { name: INotificationPermission, value: Permission },
  ],
};

export { config };
