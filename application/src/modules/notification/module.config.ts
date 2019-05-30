/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { NotificationModule } from './notificationModule';
import { NotificationService } from './service';
import { Permission } from './Permission';
import { NOTIFICATION_SERVICE, PERMISSION } from './interface/constant';

const config = {
  entry: NotificationModule,
  provides: [
    { name: NOTIFICATION_SERVICE, value: NotificationService },
    { name: PERMISSION, value: Permission },
  ],
};

export { config };
