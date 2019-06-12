/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Â© RingCentral. All rights reserved.
 */
import { AbstractModule } from 'framework';
import { INotificationService, INotificationSettingManager } from './interface';
import { ILeaveBlockerService } from '../leave-blocker/interface';

class NotificationModule extends AbstractModule {
  @INotificationService
  private _notificationService: INotificationService;
  @ILeaveBlockerService
  private _leaveBlockService: ILeaveBlockerService;
  @INotificationSettingManager
  private _notificationSettingManager: INotificationSettingManager;

  async bootstrap() {
    this._leaveBlockService.onLeave(this.onLeaveHook);
    this._notificationService.init();
    this._notificationSettingManager.init();
  }

  dispose() {
    this._leaveBlockService.offLeave(this.onLeaveHook);
    this._notificationService.clear();
    this._notificationSettingManager.dispose();
  }

  onLeaveHook = () => {
    this._notificationService.clear();
    return false;
  }
}

export { NotificationModule };
