/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-23 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule } from 'framework/AbstractModule';
import { inject } from 'framework/ioc';
import { GeneralSettingManager } from './manager/general';
import { NotificationSoundSettingManager } from './manager/notificationSound';
import { PlaceholderSettingManager } from './manager/placeholder/PlaceholderSettingManager';

class SettingModule extends AbstractModule {
  @inject(GeneralSettingManager)
  private _generalSettingManager: GeneralSettingManager;
  @inject(NotificationSoundSettingManager)
  private _notificationSoundSettingManager: NotificationSoundSettingManager;
  @inject(PlaceholderSettingManager)
  private _placeholderSettingManager: PlaceholderSettingManager;

  bootstrap() {
    this._generalSettingManager.init();
    this._notificationSoundSettingManager.init();
    this._placeholderSettingManager.init();
  }

  dispose() {
    this._generalSettingManager.dispose();
    this._notificationSoundSettingManager.dispose();
    this._placeholderSettingManager.dispose();
  }
}

export { SettingModule };
