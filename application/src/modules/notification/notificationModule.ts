/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Â© RingCentral. All rights reserved.
 */
import { AbstractModule } from 'framework';
import { INotificationService } from './interface';
import { ILeaveBlockerService } from '../leave-blocker/interface';

class NotificationModule extends AbstractModule {
  @INotificationService
  private _notificationService: INotificationService;
  @ILeaveBlockerService
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
