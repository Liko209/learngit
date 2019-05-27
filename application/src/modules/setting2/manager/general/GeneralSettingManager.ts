/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 11:31:25
 * Copyright © RingCentral. All rights reserved.
 */

import { ISettingService, SETTING_ITEM_TYPE } from '@/interface/setting';
import {
  SETTING_PAGE_GENERAL,
  SETTING_SECTION_GENERAL,
  SETTING_ITEM_PLACE_HOLDER,
} from './constant';

class GeneralSettingManager {
  private _scope = Symbol('GeneralSettingManager');
  @ISettingService private _settingService: ISettingService;

  init() {
    this._settingService.registerPage(this._scope, {
      id: SETTING_PAGE_GENERAL,
      icon: 'settings',
      title: 'setting.general',
      path: '/general',
      weight: 0,
      sections: [
        {
          id: SETTING_SECTION_GENERAL,
          title: 'General',
          weight: 0,
          items: [
            {
              id: SETTING_ITEM_PLACE_HOLDER,
              title: 'placeholder',
              description:
                'placeholder placeholder placeholder placeholder placeholder',
              type: SETTING_ITEM_TYPE.SELECT,
              weight: 0,
            },
          ],
        },
      ],
    });
  }

  dispose() {
    this._settingService.unRegisterAll(this._scope);
  }
}

export { GeneralSettingManager };
