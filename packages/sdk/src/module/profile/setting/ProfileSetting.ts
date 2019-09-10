/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-09 17:21:43
 * Copyright © RingCentral. All rights reserved.
 */
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
import { AccountService } from 'sdk/module/account';
import { MessageBadgeSettingHandler } from './itemHandler/MessageBadgeSettingHandler';
import { ProfileSubscribeEntityHandler } from './itemHandler/ProfileSubscribeEntityHandler';
import { AudioTeamMessagesSettingHandler } from './itemHandler/AudioTeamMessagesSettingHandler';
import { AudioPhoneSoundsSettingHandler } from './itemHandler/AudioPhoneSoundsSettingHandler';
import {
  SETTING_KEYS,
  EMAIL_NOTIFICATION_OPTIONS,
  NOTIFICATION_OPTIONS,
  SoundsList,
  RingsList,
  RINGS_TYPE,
  SOUNDS_TYPE,
  mobileTeamNotificationList,
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
  MAX_LEFTRAIL_GROUP_VALUE_LIST,
  MAX_LEFTRAIL_GROUP_DEFAULT_VALUE,
} from '../constants';
import { AudioMessageSoundsSettingHandler } from './itemHandler/AudioMessageSoundsSettingHandler';

type HandlerMap = {
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
  [SettingEntityIds.MOBILE_DM]: ProfileSubscribeEntityHandler<
    MOBILE_TEAM_NOTIFICATION_OPTIONS
  >;
  [SettingEntityIds.MOBILE_Team]: ProfileSubscribeEntityHandler<
    MOBILE_TEAM_NOTIFICATION_OPTIONS
  >;
  [SettingEntityIds.Audio_TeamMessages]: AudioTeamMessagesSettingHandler;
  [SettingEntityIds.Audio_DirectMessage]: AudioMessageSoundsSettingHandler;
  [SettingEntityIds.Audio_Mentions]: AudioMessageSoundsSettingHandler;
  [SettingEntityIds.Audio_IncomingCalls]: AudioPhoneSoundsSettingHandler;
  [SettingEntityIds.Max_Conversations]: ProfileSubscribeEntityHandler<number>;
  [SettingEntityIds.Link_Preview]: ProfileSubscribeEntityHandler<boolean>;
};

class ProfileSetting extends BaseModuleSetting<HandlerMap> {
  constructor(
    private _profileService: IProfileService,
    private _accountService: AccountService,
    private _settingService: SettingService,
  ) {
    super();
  }

  getHandlerMap() {
    return {
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
      [SettingEntityIds.Notification_DirectMessages]: new ProfileSubscribeEntityHandler<
        EMAIL_NOTIFICATION_OPTIONS
      >(this._profileService, {
        id: SettingEntityIds.Notification_DirectMessages,
        setting_key: SETTING_KEYS.EMAIL_DM,
        source: [
          EMAIL_NOTIFICATION_OPTIONS.EVERY_15_MESSAGE,
          EMAIL_NOTIFICATION_OPTIONS.EVERY_HOUR,
          EMAIL_NOTIFICATION_OPTIONS.OFF,
        ],
      }),
      [SettingEntityIds.Notification_Mentions]: new ProfileSubscribeEntityHandler<
        NOTIFICATION_OPTIONS
      >(this._profileService, {
        id: SettingEntityIds.Notification_Mentions,
        setting_key: SETTING_KEYS.EMAIL_MENTION,
      }),
      [SettingEntityIds.Notification_Teams]: new ProfileSubscribeEntityHandler<
        EMAIL_NOTIFICATION_OPTIONS
      >(this._profileService, {
        id: SettingEntityIds.Notification_Teams,
        setting_key: SETTING_KEYS.EMAIL_TEAM,
        source: [
          EMAIL_NOTIFICATION_OPTIONS.EVERY_15_MESSAGE,
          EMAIL_NOTIFICATION_OPTIONS.EVERY_HOUR,
          EMAIL_NOTIFICATION_OPTIONS.OFF,
        ],
      }),
      [SettingEntityIds.Notification_DailyDigest]: new ProfileSubscribeEntityHandler<
        NOTIFICATION_OPTIONS
      >(this._profileService, {
        id: SettingEntityIds.Notification_DailyDigest,
        setting_key: SETTING_KEYS.EMAIL_TODAY,
      }),
      [SettingEntityIds.MOBILE_DM]: new ProfileSubscribeEntityHandler<
        MOBILE_TEAM_NOTIFICATION_OPTIONS
      >(this._profileService, {
        id: SettingEntityIds.MOBILE_DM,
        setting_key: SETTING_KEYS.MOBILE_DM,
      }),
      [SettingEntityIds.MOBILE_Team]: new ProfileSubscribeEntityHandler<
        MOBILE_TEAM_NOTIFICATION_OPTIONS
      >(this._profileService, {
        id: SettingEntityIds.MOBILE_Team,
        setting_key: SETTING_KEYS.MOBILE_TEAM,
        source: mobileTeamNotificationList,
      }),
      [SettingEntityIds.Audio_TeamMessages]: new AudioTeamMessagesSettingHandler(
        this._profileService,
      ),
      [SettingEntityIds.Audio_DirectMessage]: new AudioMessageSoundsSettingHandler(
        this._profileService,
        {
          id: SettingEntityIds.Audio_DirectMessage,
          setting_key: SETTING_KEYS.AUDIO_DIRECT_MESSAGES,
          source: SoundsList,
          defaultValue: SOUNDS_TYPE.Log_Drum,
        },
      ),
      [SettingEntityIds.Audio_Mentions]: new AudioMessageSoundsSettingHandler(
        this._profileService,
        {
          id: SettingEntityIds.Audio_Mentions,
          setting_key: SETTING_KEYS.AUDIO_MENTIONS,
          source: SoundsList,
          defaultValue: SOUNDS_TYPE.Bing_Bong,
        },
      ),
      [SettingEntityIds.Audio_IncomingCalls]: new AudioPhoneSoundsSettingHandler(
        this._profileService,
        {
          id: SettingEntityIds.Audio_IncomingCalls,
          setting_key: SETTING_KEYS.AUDIO_INCOMING_CALLS,
          source: RingsList,
          defaultValue: RINGS_TYPE.High_Gong,
        },
      ),
      // conversations
      [SettingEntityIds.Link_Preview]: new ProfileSubscribeEntityHandler<
        boolean
      >(this._profileService, {
        id: SettingEntityIds.Link_Preview,
        setting_key: SETTING_KEYS.SHOW_LINK_PREVIEWS,
        defaultValue: true,
      }),
      [SettingEntityIds.Max_Conversations]: new ProfileSubscribeEntityHandler<
        number
      >(this._profileService, {
        id: SettingEntityIds.Max_Conversations,
        setting_key: SETTING_KEYS.MAX_LEFTRAIL_GROUP,
        source: MAX_LEFTRAIL_GROUP_VALUE_LIST,
        defaultValue: MAX_LEFTRAIL_GROUP_DEFAULT_VALUE,
      }),
    };
  }
}

export { ProfileSetting };
