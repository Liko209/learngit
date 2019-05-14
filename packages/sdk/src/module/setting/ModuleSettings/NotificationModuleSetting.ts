/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-05 18:42:17
 * Copyright © RingCentral. All rights reserved.
 */

import { ModuleSettingTypes } from '../entity';
import { SettingModuleIds } from '../constants';
import { BaseModuleSetting } from './BaseModuleSetting';

class NotificationModuleSetting extends BaseModuleSetting {
  constructor() {
    const SettingIdWeight = SettingModuleIds.NotificationSetting;
    super(
      SettingIdWeight.id,
      SettingIdWeight.weight,
      ModuleSettingTypes.MESSAGING,
    );
  }
}

export { NotificationModuleSetting };
