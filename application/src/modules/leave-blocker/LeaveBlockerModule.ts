/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-02-02 14:33:31
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule, inject } from 'framework';
import { LeaveBlockerService } from './service';
import { LEAVE_BLOCKER_SERVICE } from './interface';

class LeaveBlockerModule extends AbstractModule {
  @inject(LEAVE_BLOCKER_SERVICE)
  private _leaveBlockerService: LeaveBlockerService;

  async bootstrap() {
    this._leaveBlockerService.init();
  }

  async dispose() {
    this._leaveBlockerService.dispose();
  }
}

export { LeaveBlockerModule };
