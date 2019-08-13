/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Â© RingCentral. All rights reserved.
 */
import { AbstractModule } from 'framework/AbstractModule';
import { INotificationService, INotificationSettingManager } from './interface';
import { notificationCenter } from 'sdk/service';
import { SERVICE } from 'sdk/service/eventKey';

class NotificationModule extends AbstractModule {
  @INotificationService
  private _notificationService: INotificationService;
  @INotificationSettingManager
  private _notificationSettingManager: INotificationSettingManager;

  async bootstrap() {
    this._notificationService.init();
    this._notificationSettingManager.init();
    notificationCenter.on(SERVICE.LOGOUT, this.onLogoutHook);
  }

  dispose() {
    notificationCenter.off(SERVICE.LOGOUT, this.onLogoutHook);
    this._notificationService.clear();
    this._notificationSettingManager.dispose();
  }

  onLogoutHook = () => {
    this._notificationService.clear();
  };
}

export { NotificationModule };
