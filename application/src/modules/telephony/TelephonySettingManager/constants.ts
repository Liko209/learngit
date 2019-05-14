/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-07 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingModuleIds } from 'sdk/module/setting';
const SETTING_ITEM_ID = {
  SETTING_PHONE_CALLERID_SETTINGS: {
    id: SettingModuleIds.CallerIdSetting.id,
    automationKey: 'callerID',
    label: 'setting.phone.general.callerID.label',
    description: 'setting.phone.general.callerID.description',
  },
  SETTING_PHONE_EXTENSIONS_SETTINGS: {
    id: SettingModuleIds.ExtensionSetting.id,
    automationKey: 'extensions',
    label: 'setting.phone.general.extensions.label',
    description: 'setting.phone.general.extensions.description',
  },
  SETTING_PHONE_REGION_SETTINGS: {
    id: SettingModuleIds.RegionSetting.id,
  },
};

export { SETTING_ITEM_ID };
