/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-23 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { inject } from 'framework';
import { ISettingService, SETTING_SERVICE } from '@/modules/setting/interface';
import { buildSettingItem } from '@/modules/setting/container/SettingItemBuild';
import { SETTING_ITEM_ID } from './constants';
import { ExtensionsSettingItem } from './Extensions';
import { SelectsView } from '@/modules/setting/container/SettingItems';
import i18nT from '@/utils/i18nT';
import { RegionSettingItem } from './RegionSettingItem';

class TelephonySettingManager {
  @inject(SETTING_SERVICE) private _settingService: ISettingService;
  init = async () => {
    const {
      id,
      label,
      automationKey,
      description,
    } = SETTING_ITEM_ID.SETTING_PHONE_EXTENSIONS_SETTINGS;
    const {
      id: CallerID,
      label: CallerIDLabel,
      automationKey: CallerIDAutomationKey,
      description: CallerIDDescription,
    } = SETTING_ITEM_ID.SETTING_PHONE_CALLERID_SETTINGS;
    this._settingService.registerSettingItem({
      [CallerID]: buildSettingItem({
        label: await i18nT(CallerIDLabel),
        automationKey: CallerIDAutomationKey,
        description: await i18nT(CallerIDDescription),
        Right: SelectsView,
      }),
      [id]: buildSettingItem({
        automationKey,
        label: await i18nT(label),
        description: await i18nT(description),
        Right: ExtensionsSettingItem,
      }),
    });

    const { id: regionId } = SETTING_ITEM_ID.SETTING_PHONE_REGION_SETTINGS;
    this._settingService.registerSettingItem({
      [regionId]: props => <RegionSettingItem {...props} />,
    });
  }
}

export { TelephonySettingManager };
