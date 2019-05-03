/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 16:12:23
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyModule } from './TelephonyModule';
import { TelephonyService } from './service';
import { TelephonyStore } from './store';
import { TelephonyNotificationManager } from './TelephonyNotificationManager';
import { TELEPHONY_SERVICE } from './interface/constant';

const config = {
  entry: TelephonyModule,
  provides: [
    { name: TELEPHONY_SERVICE, value: TelephonyService },
    TelephonyStore,
    TelephonyNotificationManager,
  ],
};

export { config };
