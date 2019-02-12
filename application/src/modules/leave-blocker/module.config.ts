/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-02-02 14:33:34
 * Copyright © RingCentral. All rights reserved.
 */
import { LeaveBlockerModule } from './LeaveBlockerModule';
import { LeaveBlockerService } from './service';

const config = {
  entry: LeaveBlockerModule,
  provides: {
    LeaveBlockerService,
  },
};

export { config };
