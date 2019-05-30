/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 11:31:21
 * Copyright © RingCentral. All rights reserved.
 */

import { ISettingService } from '@/interface/setting';
import {
  SETTING_PAGE__NOTIFICATION_SOUND,
  SETTING_SECTION__SOUNDS,
} from './constant';

class NotificationSoundSettingManager {
  private _scope = Symbol('NotificationSoundSettingManager');
  @ISettingService private _settingService: ISettingService;

  init() {
    this._settingService.registerPage(this._scope, {
      id: SETTING_PAGE__NOTIFICATION_SOUND,
      icon: 'bell',
      title: 'setting.notificationAndSounds',
      path: '/notification_and_sounds',
      weight: 100,
      sections: [
        {
          id: SETTING_SECTION__SOUNDS,
          title: 'setting.sounds',
          weight: 200,
          items: [],
        },
      ],
    });
  }

  dispose() {
    this._settingService.unRegisterAll(this._scope);
  }
}

export { NotificationSoundSettingManager };
