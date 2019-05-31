/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework';
import { NotificationModule } from './notificationModule';
import { NotificationService } from './service';
import { INotificationService } from './interface';
import { PERMISSION } from './interface/constant';
import { Permission } from './Permission';

const config: ModuleConfig = {
  entry: NotificationModule,
  provides: [
    { name: INotificationService, value: NotificationService },
    { name: PERMISSION, value: Permission },
  ],
};

export { config };
