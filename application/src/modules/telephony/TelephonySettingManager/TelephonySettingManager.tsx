/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-23 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { inject } from 'framework';
import { SettingModuleIds } from 'sdk/module/setting';
import { ISettingService } from '@/modules/setting/interface';
import { buildSettingItem } from '@/modules/setting/container/SettingItemBuild';
import { ExtensionsSettingItem } from './Extensions';
import { CallerIdSettingItem } from './CallerIdSettingItem';
import i18nT from '@/utils/i18nT';
import { RegionSettingItem } from './RegionSettingItem';

const { CallerIdSetting, ExtensionSetting, RegionSetting } = SettingModuleIds;

class TelephonySettingManager {
  @inject(ISettingService) private _settingService: ISettingService;

  async init() {
    this._settingService.registerSettingItem({
      [CallerIdSetting.id]: await this._buildCallerSettingItem(),
      [ExtensionSetting.id]: await this._buildExtensionsSettingItem(),
      [RegionSetting.id]: RegionSettingItem,
    });
  }

  dispose() {
    this._settingService.unRegisterSettingItem(CallerIdSetting.id.toString());
    this._settingService.unRegisterSettingItem(ExtensionSetting.id.toString());
    this._settingService.unRegisterSettingItem(RegionSetting.id.toString());
  }

  private async _buildCallerSettingItem() {
    return buildSettingItem({
      automationKey: 'callerID',
      label: await i18nT('setting.phone.general.callerID.label'),
      description: await i18nT('setting.phone.general.callerID.description'),
      Right: CallerIdSettingItem,
    });
  }

  private async _buildExtensionsSettingItem() {
    return buildSettingItem({
      automationKey: 'extensions',
      label: await i18nT('setting.phone.general.extensions.label'),
      description: await i18nT('setting.phone.general.extensions.description'),
      Right: ExtensionsSettingItem,
    });
  }
}

export { TelephonySettingManager };
