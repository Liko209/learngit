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
  SETTING_ITEM__PHONE_REGION,
  SETTING_ITEM__PHONE_EXTENSIONS,
} from './constant';
import { RegionSettingItem } from './RegionSettingItem';

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
              sourceRenderer: CallerIdSelectSourceItem,
            } as SelectSettingItem<IPhoneNumberRecord>,
            {
              id: SETTING_ITEM__PHONE_REGION,
              type: RegionSettingItem,
              weight: 100,
            },
            {
              id: SETTING_ITEM__PHONE_EXTENSIONS,
              title: 'setting.phone.general.extensions.label',
              description: 'setting.phone.general.extensions.description',
              type: SETTING_ITEM_TYPE.LINK,
              weight: 200,
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

export { TelephonySettingManager };
