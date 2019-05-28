/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-23 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule, inject } from 'framework';
import { GeneralSettingManager } from './manager/general';
import { NotificationSoundSettingManager } from './manager/notificationSound';

class SettingModule extends AbstractModule {
  @inject(GeneralSettingManager)
  private _generalSettingManager: GeneralSettingManager;
  @inject(NotificationSoundSettingManager)
  private _notificationSoundSettingManager: NotificationSoundSettingManager;

  bootstrap() {
    this._generalSettingManager.init();
    this._notificationSoundSettingManager.init();
  }

  dispose() {
    this._generalSettingManager.dispose();
    this._notificationSoundSettingManager.dispose();
  }
}

export { SettingModule };
