/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 11:31:25
 * Copyright © RingCentral. All rights reserved.
 */

import { ISettingService } from '@/interface/setting';
import { SETTING_PAGE__GENERAL, SETTING_SECTION__GENERAL } from './constant';

class GeneralSettingManager {
  private _scope = Symbol('GeneralSettingManager');
  @ISettingService private _settingService: ISettingService;

  init() {
    this._settingService.registerPage(this._scope, {
      id: SETTING_PAGE__GENERAL,
      automationId: 'general',
      icon: 'settings',
      title: 'setting.general',
      path: '/general',
      weight: 0,
      sections: [
        {
          id: SETTING_SECTION__GENERAL,
          title: 'setting.general',
          weight: 0,
          items: [],
        },
      ],
    });
  }

  dispose() {
    this._settingService.unRegisterAll(this._scope);
  }
}

export { GeneralSettingManager };
