/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-02-02 14:33:31
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule } from 'framework/AbstractModule';
import { LeaveBlockerService } from './service';
import { ILeaveBlockerService } from './interface';

class LeaveBlockerModule extends AbstractModule {
  @ILeaveBlockerService
  private _leaveBlockerService: LeaveBlockerService;

  async bootstrap() {
    this._leaveBlockerService.init();
  }

  async dispose() {
    this._leaveBlockerService.dispose();
  }
}

export { LeaveBlockerModule };
