/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { ModuleConfig, Jupiter } from 'framework';
import { NotificationModule } from './notificationModule';
import { NotificationService } from './service';
import { INotificationService } from './interface';

const config: ModuleConfig = {
  entry: NotificationModule,
  binding: (jupiter: Jupiter) => {
    jupiter.registerService(INotificationService, NotificationService);
  },
};

export { config };
