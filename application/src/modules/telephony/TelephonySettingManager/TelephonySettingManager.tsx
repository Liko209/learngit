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
  SETTING_ITEM__PHONE_DEFAULT_PHONE_APP,
  SETTING_ITEM__NOTIFICATION_INCOMING_CALLS,
  SETTING_ITEM__NOTIFICATION_CALLS_VOICEMAILS,
} from './constant';
import { RegionSettingItem } from './RegionSettingItem';
import { DefaultPhoneAppSelectItem } from './DefaultPhoneAppSettingItem';
import { CALLING_OPTIONS } from 'sdk/module/profile/constants';
import { SETTING_SECTION__DESKTOP_NOTIFICATIONS } from '@/modules/notification/notificationSettingManager/constant';

class TelephonySettingManager {
  private _scope = Symbol('TelephonySettingManager');
  @ISettingService private _settingService: ISettingService;

  async init() {
    this._settingService.registerPage(this._scope, {
      id: SETTING_PAGE__PHONE,
      automationId: 'phone',
      icon: 'phone',
      title: 'setting.phone.title',
      path: '/phone',
      weight: 300,
      sections: [
        {
          id: SETTING_SECTION__PHONE_GENERAL,
          automationId: 'phoneGeneral',
          title: 'setting.phone.general.title',
          weight: 0,
          items: [
            {
              id: SETTING_ITEM__PHONE_DEFAULT_PHONE_APP,
              title: 'setting.phone.general.defaultPhoneApp.label',
              description: 'setting.phone.general.defaultPhoneApp.description',
              type: SETTING_ITEM_TYPE.SELECT,
              weight: 100,
              sourceRenderer: DefaultPhoneAppSelectItem,
              automationId: 'defaultPhoneApp',
            } as SelectSettingItem<CALLING_OPTIONS>,
            {
              id: SETTING_ITEM__PHONE_CALLER_ID,
              automationId: 'callerID',
              title: 'setting.phone.general.callerID.label',
              description: 'setting.phone.general.callerID.description',
              type: SETTING_ITEM_TYPE.SELECT,
              weight: 200,
              sourceRenderer: CallerIdSelectSourceItem,
            } as SelectSettingItem<IPhoneNumberRecord>,
            {
              id: SETTING_ITEM__PHONE_REGION,
              automationId: 'regionSetting',
              type: RegionSettingItem,
              weight: 300,
            },
            {
              id: SETTING_ITEM__PHONE_EXTENSIONS,
              automationId: 'extensions',
              title: 'setting.phone.general.extensions.label',
              description: 'setting.phone.general.extensions.description',
              type: SETTING_ITEM_TYPE.LINK,
              weight: 400,
            },
          ],
        },
      ],
    });
    this._settingService.registerItem(
      this._scope,
      SETTING_SECTION__DESKTOP_NOTIFICATIONS,
      {
        id: SETTING_ITEM__NOTIFICATION_INCOMING_CALLS,
        automationId: 'incomingCalls',
        title:
          'setting.notificationAndSounds.desktopNotifications.incomingCalls.label',
        description:
          'setting.notificationAndSounds.desktopNotifications.incomingCalls.description',
        type: SETTING_ITEM_TYPE.TOGGLE,
        weight: 300,
      },
    );
    this._settingService.registerItem(
      this._scope,
      SETTING_SECTION__DESKTOP_NOTIFICATIONS,
      {
        id: SETTING_ITEM__NOTIFICATION_CALLS_VOICEMAILS,
        automationId: 'callsAndVoicemails',
        title:
          'setting.notificationAndSounds.desktopNotifications.callsAndVoicemails.label',
        description:
          'setting.notificationAndSounds.desktopNotifications.callsAndVoicemails.description',
        type: SETTING_ITEM_TYPE.TOGGLE,
        weight: 400,
      },
    );
  }

  dispose() {
    this._settingService.unRegisterAll(this._scope);
  }
}

export { TelephonySettingManager };
