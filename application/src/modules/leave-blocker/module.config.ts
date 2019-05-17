/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-02-02 14:33:34
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig, Jupiter } from 'framework';
import { LeaveBlockerModule } from './LeaveBlockerModule';
import { LeaveBlockerService } from './service';
import { ILeaveBlockerService } from './interface';

const config: ModuleConfig = {
  entry: LeaveBlockerModule,
  binding: (jupiter: Jupiter) => {
    jupiter.registerService(ILeaveBlockerService, LeaveBlockerService);
  },
};

export { config };
