/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-02-02 14:33:34
 * Copyright © RingCentral. All rights reserved.
 */
import { LeaveBlockerModule } from './LeaveBlockerModule';
import { LeaveBlockerService } from './service';
import { LEAVE_BLOCKER_SERVICE } from './interface';

const config = {
  entry: LeaveBlockerModule,
  provides: [
    {
      name: LEAVE_BLOCKER_SERVICE,
      value: LeaveBlockerService,
    },
  ],
};

export { config };
