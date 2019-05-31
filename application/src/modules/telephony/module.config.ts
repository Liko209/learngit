/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 16:12:23
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework';
import { TelephonyModule } from './TelephonyModule';
import { TelephonyService } from './service';
import { TelephonyStore } from './store';
import { TelephonyNotificationManager } from './TelephonyNotificationManager';
import { TelephonySettingManager } from './TelephonySettingManager/TelephonySettingManager';
import { TELEPHONY_SERVICE } from './interface/constant';

const config: ModuleConfig = {
  entry: TelephonyModule,
  provides: [
    {
      name: TELEPHONY_SERVICE,
      value: TelephonyService,
    },
    TelephonyStore,
    TelephonyNotificationManager,
    TelephonySettingManager,
  ],
};

export { config };
