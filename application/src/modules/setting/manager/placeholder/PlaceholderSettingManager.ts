/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 11:31:21
 * Copyright © RingCentral. All rights reserved.
 */

import { ISettingService } from '@/interface/setting';
import {
  SETTING_PAGE__MEETINGS,
  SETTING_PAGE__MESSAGES,
  SETTING_PAGE__CALENDAR,
} from './constant';

class PlaceholderSettingManager {
  private _scope = Symbol('PlaceHolderSettingManager');
  @ISettingService private _settingService: ISettingService;

  init() {
    this._settingService.registerPage(this._scope, {
      id: SETTING_PAGE__MESSAGES,
      automationId: 'messages',
      icon: 'messages',
      title: 'setting.messages',
      path: '/messages',
      weight: 200,
      sections: [],
      dataTracking: { name: 'messages' },
    });
    this._settingService.registerPage(this._scope, {
      id: SETTING_PAGE__MEETINGS,
      automationId: 'meetings',
      icon: 'meetings',
      title: 'setting.meetings',
      path: '/meetings',
      weight: 400,
      sections: [],
    });
    this._settingService.registerPage(this._scope, {
      id: SETTING_PAGE__CALENDAR,
      automationId: 'calendar',
      icon: 'calendar',
      title: 'setting.calendar',
      path: '/calendar',
      weight: 500,
      sections: [],
    });
  }

  dispose() {
    this._settingService.unRegisterAll(this._scope);
  }
}

export { PlaceholderSettingManager };
