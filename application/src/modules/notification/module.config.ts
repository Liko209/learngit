/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework';
import { NotificationModule } from './notificationModule';
import { NotificationService } from './service';
import { INotificationService, INotificationSettingManager } from './interface';
import { NotificationSettingManager } from './notificationSettingManager/notificationSettingManager';
import { Permission } from './Permission';
import { PERMISSION } from './interface/constant';
const config: ModuleConfig = {
  entry: NotificationModule,
  binding: (jupiter: Jupiter) => {
    jupiter.registerService(INotificationService, NotificationService);
    jupiter.registerService(
      INotificationSettingManager,
      NotificationSettingManager,
    );
    jupiter.registerService(PERMISSION, Permission);
  },
};

export { config };
