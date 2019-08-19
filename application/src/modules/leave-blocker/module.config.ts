/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-02-02 14:33:34
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework/types';
import { LeaveBlockerModule } from './LeaveBlockerModule';
import { LeaveBlockerService } from './service';
import { ILeaveBlockerService } from './interface';

const config: ModuleConfig = {
  entry: LeaveBlockerModule,
  provides: [{ name: ILeaveBlockerService, value: LeaveBlockerService }],
};

export { config };
