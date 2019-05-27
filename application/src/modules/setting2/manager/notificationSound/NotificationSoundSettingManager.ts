/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 11:31:21
 * Copyright © RingCentral. All rights reserved.
 */

import { ISettingService } from '@/interface/setting';

const SETTING_PAGE_NOTIFICATION_SOUND = 'SETTING_PAGE.NOTIFICATION_SOUND';

class NotificationSoundSettingManager {
  private _scope = Symbol('NotificationSoundSettingManager');
  @ISettingService private _settingService: ISettingService;

  init() {
    this._settingService.registerPage(this._scope, {
      id: SETTING_PAGE_NOTIFICATION_SOUND,
      icon: 'bell',
      title: 'setting.notificationAndSounds',
      path: '/notification_and_sounds',
      weight: 100,
      sections: [],
    });
  }

  dispose() {
    this._settingService.unRegisterAll(this._scope);
  }
}

export { NotificationSoundSettingManager };
