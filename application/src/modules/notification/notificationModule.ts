import { INotificationService } from './interface/index';
/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Â© RingCentral. All rights reserved.
 */
import { AbstractModule, inject } from 'framework';
import { NOTIFICATION_SERVICE } from './interface/constant';
import {
  LEAVE_BLOCKER_SERVICE,
  ILeaveBlockerService,
} from '../leave-blocker/interface';

class NotificationModule extends AbstractModule {
  @inject(NOTIFICATION_SERVICE)
  private _notificationService: INotificationService;
  @inject(LEAVE_BLOCKER_SERVICE)
  private _leaveBlockService: ILeaveBlockerService;

  async bootstrap() {
    this._leaveBlockService.onLeave(this.onLeaveHook);
    this._notificationService.init();
  }

  dispose() {
    this._leaveBlockService.offLeave(this.onLeaveHook);
    this._notificationService.clear();
  }

  onLeaveHook = () => {
    this._notificationService.clear();
    return false;
  }
}

export { NotificationModule };
