/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-23 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
// import React from 'react';
import {
  ISettingService,
  SETTING_ITEM_TYPE,
  SelectSettingItem,
} from '@/interface/setting';
import { CallerIdSelectSourceItem } from './CallerIdSettingItem';
import { IPhoneNumberRecord } from 'sdk/api/ringcentral/types/common';
import {
  SETTING_PAGE__PHONE,
  SETTING_SECTION__PHONE_GENERAL,
  SETTING_ITEM__PHONE_CALLER_ID,
} from './constant';
// import { buildSettingItem } from '@/modules/setting/container/SettingItemBuild';
// import { ExtensionsSettingItem } from './Extensions';
// import { CallerIdSettingItem } from './CallerIdSettingItem';
// import i18nT from '@/utils/i18nT';
// import { RegionSettingItem } from './RegionSettingItem';

// const { CallerIdSetting, ExtensionSetting, RegionSetting } = SettingModuleIds;

class TelephonySettingManager {
  private _scope = Symbol('TelephonySettingManager');
  @ISettingService private _settingService: ISettingService;

  async init() {
    this._settingService.registerPage(this._scope, {
      id: SETTING_PAGE__PHONE,
      icon: 'phone',
      title: 'setting.phone.title',
      path: '/phone',
      weight: 300,
      sections: [
        {
          id: SETTING_SECTION__PHONE_GENERAL,
          title: 'setting.phone.general.title',
          weight: 0,
          items: [
            {
              id: SETTING_ITEM__PHONE_CALLER_ID,
              title: 'setting.phone.general.callerID.label',
              description: 'setting.phone.general.callerID.description',
              type: SETTING_ITEM_TYPE.SELECT,
              weight: 0,
              // valueRenderer: (value: IPhoneNumberRecord) => <div>value</div>,
              sourceRenderer: CallerIdSelectSourceItem,
            } as SelectSettingItem<IPhoneNumberRecord>,
          ],
        },
      ],
    });
  }

  dispose() {
    this._settingService.unRegisterAll(this._scope);
  }

  // private async _buildCallerSettingItem() {
  //   return buildSettingItem({
  //     automationKey: 'callerID',
  //     label: await i18nT('setting.phone.general.callerID.label'),
  //     description: await i18nT('setting.phone.general.callerID.description'),
  //     Right: CallerIdSettingItem,
  //   });
  // }

  // private async _buildExtensionsSettingItem() {
  //   return buildSettingItem({
  //     automationKey: 'extensions',
  //     label: await i18nT('setting.phone.general.extensions.label'),
  //     description: await i18nT('setting.phone.general.extensions.description'),
  //     Right: ExtensionsSettingItem,
  //   });
  // }
}

export { TelephonySettingManager };
