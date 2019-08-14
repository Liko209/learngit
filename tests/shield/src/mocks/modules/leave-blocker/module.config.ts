/*
 * @Author: isaac.liu
 * @Date: 2019-06-27 08:24:45
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework/types';
import { createDummyConfig } from '../utils';
import { LeaveBlockerService } from './service';
import { ILeaveBlockerService } from './interface';

const config: ModuleConfig = createDummyConfig({
  name: ILeaveBlockerService,
  value: LeaveBlockerService,
});

export { config };
