/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-23 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import {
  ISettingService,
  SETTING_ITEM_TYPE,
  SelectSettingItem,
} from '@/interface/setting';
import { IPhoneNumberRecord } from 'sdk/api/ringcentral/types/common';
import {
  SETTING_PAGE__PHONE,
  SETTING_SECTION__PHONE_GENERAL,
<<<<<<< HEAD
  PHONE_SETTING_ITEM,
=======
  SETTING_ITEM__PHONE_CALLER_ID,
  SETTING_ITEM__PHONE_REGION,
  SETTING_ITEM__PHONE_EXTENSIONS,
  SETTING_ITEM__PHONE_DEFAULT_PHONE_APP,
  SETTING_ITEM__NOTIFICATION_INCOMING_CALLS,
  SETTING_ITEM__NOTIFICATION_CALLS_VOICEMAILS,
  SETTING_ITEM__PHONE_E911,
>>>>>>> origin/develop
} from './constant';
import {
  CallerIdSelectSourceItem,
  CallerIdSelectValue,
} from './CallerIdSettingItem';
import { RegionSettingItem } from './RegionSettingItem';
import {
  DefaultPhoneAppSelectItem,
  beforeDefaultPhoneAppSettingSave,
} from './DefaultPhoneAppSettingItem';
import {
  CALLING_OPTIONS,
  AUDIO_SOUNDS_INFO,
} from 'sdk/module/profile/constants';
import { SETTING_SECTION__DESKTOP_NOTIFICATIONS } from '@/modules/notification/notificationSettingManager/constant';
import { SETTING_SECTION__SOUNDS } from '@/modules/setting/constant';
import {
  SoundSourceItem,
  SoundSourcePlayerRenderer,
} from '@/modules/setting/container/SettingItem/Select/SoundSourceItem.View';
import { buildTitleAndDesc } from '@/modules/setting/utils';

const DefaultPhoneAppDataTrackingOption: {
  [key in CALLING_OPTIONS]: string
} = {
  glip: 'Use RingCentral App (this app)',
  ringcentral: 'Use RingCentral Phone',
};

const CallerIDDataTrackingOption: {
  [key in IPhoneNumberRecord['usageType']]: string
} = {
  DirectNumber: '"DID", personal direct number',
  MainCompanyNumber: '"companyMain", company main number',
  Blocked: 'blocked',
  CompanyOther:
    '"companyOther", company number with nick name or company fax number',
};

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
              id: PHONE_SETTING_ITEM.PHONE_DEFAULT_PHONE_APP,
              title: 'setting.phone.general.defaultPhoneApp.label',
              description: 'setting.phone.general.defaultPhoneApp.description',
              type: SETTING_ITEM_TYPE.SELECT,
              weight: 100,
              sourceRenderer: DefaultPhoneAppSelectItem,
              beforeSaving: beforeDefaultPhoneAppSettingSave,
              dataTracking: {
                name: 'defaultPhoneApp',
                type: 'phoneGeneral',
                optionTransform: value =>
                  DefaultPhoneAppDataTrackingOption[value],
              },
              automationId: 'defaultPhoneApp',
            } as SelectSettingItem<CALLING_OPTIONS>,
            {
              id: PHONE_SETTING_ITEM.PHONE_CALLER_ID,
              automationId: 'callerID',
              title: 'setting.phone.general.callerID.label',
              description: 'setting.phone.general.callerID.description',
              type: SETTING_ITEM_TYPE.SELECT,
              weight: 200,
              sourceRenderer: CallerIdSelectSourceItem,
              valueRenderer: CallerIdSelectValue,
              dataTracking: {
                name: 'callerID',
                type: 'phoneGeneral',
                optionTransform: value =>
                  CallerIDDataTrackingOption[value.usageType] ||
                  CallerIDDataTrackingOption.CompanyOther,
              },
            } as SelectSettingItem<IPhoneNumberRecord>,
            {
              id: PHONE_SETTING_ITEM.PHONE_REGION,
              automationId: 'regionSetting',
              type: RegionSettingItem,
              weight: 300,
            },
            {
              id: PHONE_SETTING_ITEM.PHONE_EXTENSIONS,
              automationId: 'extensions',
              title: 'setting.phone.general.extensions.label',
              description: 'setting.phone.general.extensions.description',
              type: SETTING_ITEM_TYPE.LINK,
              weight: 400,
              dataTracking: {
                name: 'extensionSettings',
                type: 'phoneGeneral',
              },
            },
            {
              id: SETTING_ITEM__PHONE_E911,
              automationId: 'e911Setting',
              type: RegionSettingItem,
              weight: 300,
            },
          ],
        },
      ],
    });
    this._settingService.registerItem(
      this._scope,
      SETTING_SECTION__DESKTOP_NOTIFICATIONS,
      {
        id: PHONE_SETTING_ITEM.NOTIFICATION_INCOMING_CALLS,
        automationId: 'incomingCalls',
        title:
          'setting.notificationAndSounds.desktopNotifications.incomingCalls.label',
        description:
          'setting.notificationAndSounds.desktopNotifications.incomingCalls.description',
        type: SETTING_ITEM_TYPE.TOGGLE,
        weight: 300,
        dataTracking: {
          name: 'incomingCall',
          type: 'desktopNotificationSettings',
        },
      },
    );
    this._settingService.registerItem(
      this._scope,
      SETTING_SECTION__DESKTOP_NOTIFICATIONS,
      {
        id: PHONE_SETTING_ITEM.NOTIFICATION_CALLS_VOICEMAILS,
        automationId: 'callsAndVoicemails',
        title:
          'setting.notificationAndSounds.desktopNotifications.callsAndVoicemails.label',
        description:
          'setting.notificationAndSounds.desktopNotifications.callsAndVoicemails.description',
        type: SETTING_ITEM_TYPE.TOGGLE,
        weight: 400,
        dataTracking: {
          name: 'missedCall',
          type: 'desktopNotificationSettings',
        },
      },
    );
    this.registerSounds();
  }
  registerSounds() {
    this._settingService.registerItem(this._scope, SETTING_SECTION__SOUNDS, {
      id: PHONE_SETTING_ITEM.SOUND_INCOMING_CALL,
      automationId: 'soundIncomingCall',
      weight: 400,
      type: SETTING_ITEM_TYPE.SELECT,
      sourceRenderer: SoundSourceItem,
      secondaryActionRenderer: SoundSourcePlayerRenderer,
      ...buildTitleAndDesc('notificationAndSounds', 'sounds', 'incomingCall'),
    } as SelectSettingItem<AUDIO_SOUNDS_INFO>);
  }

  dispose() {
    this._settingService.unRegisterAll(this._scope);
  }
}

export { TelephonySettingManager };
