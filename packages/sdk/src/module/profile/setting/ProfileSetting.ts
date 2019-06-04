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
type HandlerMap = {
  [SettingEntityIds.Phone_CallerId]: CallerIdSettingHandler;
  [SettingEntityIds.Phone_DefaultApp]: DefaultAppSettingHandler;
  [SettingEntityIds.Notification_NewMessageBadgeCount]: MessageBadgeSettingHandler;
  [SettingEntityIds.Notification_Browser]: NotificationsSettingHandler;
  [SettingEntityIds.Notification_NewMessages]: NewMessagesSettingHandler;
  [SettingEntityIds.Notification_IncomingCalls]: IncomingCallsSettingHandler;
  [SettingEntityIds.Notification_MissCallAndNewVoiceMails]: NewVoicemailsSettingHandler;
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
    };
  }
}

export { ProfileSetting };
