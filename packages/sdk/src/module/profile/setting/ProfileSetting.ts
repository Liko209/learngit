/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-09 17:21:43
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import {
  SettingEntityIds,
  BaseModuleSetting,
  SettingService,
} from 'sdk/module/setting';
import { IProfileService } from '../service/IProfileService';
import { NotificationsSettingHandler } from './itemHandler/NotificationsSettingHandler';
import { NewMessagesSettingHandler } from './itemHandler/NewMessagesSettingHandler';
import { IncomingCallsSettingHandler } from './itemHandler/IncomingCallsSettingHandler';
import { NewVoicemailsSettingHandler } from './itemHandler/NewVoicemailsSettingHandler';
import { TelephonyService } from 'sdk/module/telephony';
import { AccountService } from 'sdk/module/account';
import { CallerIdSettingHandler } from './itemHandler/CallerIdSettingHandler';
import { DefaultAppSettingHandler } from './itemHandler/DefaultAppSettingHandler';
import { MessageBadgeSettingHandler } from './itemHandler/MessageBadgeSettingHandler';
import { ProfileSubscribeEntityHandler } from './itemHandler/ProfileSubscribeEntityHandler';
import {
  SETTING_KEYS,
  EMAIL_NOTIFICATION_OPTIONS,
  NOTIFICATION_OPTIONS,
} from '../constants';
type HandlerMap = {
  [SettingEntityIds.Phone_CallerId]: CallerIdSettingHandler;
  [SettingEntityIds.Phone_DefaultApp]: DefaultAppSettingHandler;
  [SettingEntityIds.Notification_NewMessageBadgeCount]: MessageBadgeSettingHandler;
  [SettingEntityIds.Notification_Browser]: NotificationsSettingHandler;
  [SettingEntityIds.Notification_NewMessages]: NewMessagesSettingHandler;
  [SettingEntityIds.Notification_IncomingCalls]: IncomingCallsSettingHandler;
  [SettingEntityIds.Notification_MissCallAndNewVoiceMails]: NewVoicemailsSettingHandler;
  [SettingEntityIds.Notification_DirectMessages]: ProfileSubscribeEntityHandler<
    EMAIL_NOTIFICATION_OPTIONS
  >;
  [SettingEntityIds.Notification_Mentions]: ProfileSubscribeEntityHandler<
    NOTIFICATION_OPTIONS
  >;
  [SettingEntityIds.Notification_Teams]: ProfileSubscribeEntityHandler<
    EMAIL_NOTIFICATION_OPTIONS
  >;
  [SettingEntityIds.Notification_DailyDigest]: ProfileSubscribeEntityHandler<
    NOTIFICATION_OPTIONS
  >;
};

class ProfileSetting extends BaseModuleSetting<HandlerMap> {
  constructor(
    private _profileService: IProfileService,
    private _telephonyService: TelephonyService,
    private _accountService: AccountService,
    private _settingService: SettingService,
  ) {
    super();
  }

  getHandlerMap() {
    return {
      [SettingEntityIds.Phone_CallerId]: new CallerIdSettingHandler(
        this._profileService,
      ),
      [SettingEntityIds.Phone_DefaultApp]: new DefaultAppSettingHandler(
        this._accountService,
        this._profileService,
        this._telephonyService,
      ),
      [SettingEntityIds.Notification_NewMessageBadgeCount]: new MessageBadgeSettingHandler(
        this._profileService,
      ),
      [SettingEntityIds.Notification_Browser]: new NotificationsSettingHandler(
        this._profileService,
        this._accountService,
      ),
      [SettingEntityIds.Notification_NewMessages]: new NewMessagesSettingHandler(
        this._profileService,
        this._accountService,
        this._settingService,
      ),
      [SettingEntityIds.Notification_IncomingCalls]: new IncomingCallsSettingHandler(
        this._profileService,
        this._accountService,
        this._settingService,
      ),
      [SettingEntityIds.Notification_MissCallAndNewVoiceMails]: new NewVoicemailsSettingHandler(
        this._profileService,
        this._accountService,
        this._settingService,
      ),
      // prettier-ignore
      [SettingEntityIds.Notification_DirectMessages]: new ProfileSubscribeEntityHandler<EMAIL_NOTIFICATION_OPTIONS>(
        this._profileService,
        {
          id: SettingEntityIds.Notification_DirectMessages,
          setting_key: SETTING_KEYS.EMAIL_DM,
          source: [
            EMAIL_NOTIFICATION_OPTIONS.EVERY_15_MESSAGE,
            EMAIL_NOTIFICATION_OPTIONS.EVERY_HOUR,
            EMAIL_NOTIFICATION_OPTIONS.OFF,
          ],
        },
      ),
      [SettingEntityIds.Notification_Mentions]:
        // prettier-ignore
        new ProfileSubscribeEntityHandler<NOTIFICATION_OPTIONS>(
        this._profileService,
        {
          id: SettingEntityIds.Notification_Mentions,
          setting_key: SETTING_KEYS.EMAIL_MENTION,
        },
      ),
      [SettingEntityIds.Notification_Teams]:
        // prettier-ignore
        new ProfileSubscribeEntityHandler<EMAIL_NOTIFICATION_OPTIONS>(
        this._profileService,
        {
          id: SettingEntityIds.Notification_Teams,
          setting_key: SETTING_KEYS.EMAIL_TEAM,
          source: [
            EMAIL_NOTIFICATION_OPTIONS.EVERY_15_MESSAGE,
            EMAIL_NOTIFICATION_OPTIONS.EVERY_HOUR,
            EMAIL_NOTIFICATION_OPTIONS.OFF,
          ],
        },
      ),
      // prettier-ignore
      [SettingEntityIds.Notification_DailyDigest]: new ProfileSubscribeEntityHandler<NOTIFICATION_OPTIONS>(
        this._profileService,
        {
          id: SettingEntityIds.Notification_DailyDigest,
          setting_key: SETTING_KEYS.EMAIL_TODAY,
        },
      ),
    };
  }
}

export { ProfileSetting };
