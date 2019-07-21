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
import { AudioMessageSoundsSettingHandler } from './itemHandler/AudioMessageSoundsSettingHandler';
import { AudioPhoneSoundsSettingHandler } from './itemHandler/AudioPhoneSoundsSettingHandler';
import {
  SETTING_KEYS,
  EMAIL_NOTIFICATION_OPTIONS,
  NOTIFICATION_OPTIONS,
  SOUNDS_LIST,
  RINGS_LIST,
} from '../constants';

const SoundsList = [
  SOUNDS_LIST.Double_Beeps,
  SOUNDS_LIST.Triple_Beeps,
  SOUNDS_LIST.Alert,
  SOUNDS_LIST.Alert_Double,
  SOUNDS_LIST.Alert_Triple,
  SOUNDS_LIST.Bing_Bong,
  SOUNDS_LIST.Ching,
  SOUNDS_LIST.Log_Drum,
  SOUNDS_LIST.Snap,
  SOUNDS_LIST.Squirt,
  SOUNDS_LIST.Whoosh,
  SOUNDS_LIST.Whoosh_Double,
  SOUNDS_LIST.Off,
];

const RingsList = [
  RINGS_LIST.Phone_Ring,
  RINGS_LIST.Air_Raid,
  RINGS_LIST.Allusive,
  RINGS_LIST.Attention,
  RINGS_LIST.Blub_Blub,
  RINGS_LIST.Buzzy,
  RINGS_LIST.Channel_Open,
  RINGS_LIST.Disco,
  RINGS_LIST.Door_Bell,
  RINGS_LIST.Fairy,
  RINGS_LIST.Fast_Bells,
  RINGS_LIST.High_Gong,
  RINGS_LIST.Indeed,
  RINGS_LIST.Nice,
  RINGS_LIST.Ringing_Bells,
  RINGS_LIST.Ring,
  RINGS_LIST.Simple,
  RINGS_LIST.Soothing,
  RINGS_LIST.Off,
];

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
  [SettingEntityIds.Audio_TeamMessages]: ProfileSubscribeEntityHandler<
    SOUNDS_LIST
  >;
  [SettingEntityIds.Audio_DirectMessage]: AudioMessageSoundsSettingHandler<
    SOUNDS_LIST
  >;
  [SettingEntityIds.Audio_Mentions]: AudioMessageSoundsSettingHandler<
    SOUNDS_LIST
  >;
  [SettingEntityIds.Audio_IncomingCalls]: AudioPhoneSoundsSettingHandler<
    RINGS_LIST
  >;
  [SettingEntityIds.Audio_NewVoicemail]: AudioPhoneSoundsSettingHandler<
    SOUNDS_LIST
  >;
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
      [SettingEntityIds.Audio_TeamMessages]: new ProfileSubscribeEntityHandler<
        SOUNDS_LIST
      >(this._profileService, {
        id: SettingEntityIds.Audio_TeamMessages,
        setting_key: SETTING_KEYS.AUDIO_TEAM_MESSAGES,
        source: SoundsList,
        defaultValue: SOUNDS_LIST.Log_Drum,
      }),
      [SettingEntityIds.Audio_DirectMessage]: new AudioMessageSoundsSettingHandler<
        SOUNDS_LIST
      >(this._profileService, {
        id: SettingEntityIds.Audio_DirectMessage,
        setting_key: SETTING_KEYS.AUDIO_DIRECT_MESSAGES,
        source: SoundsList,
        defaultValue: SOUNDS_LIST.Log_Drum,
      }),
      [SettingEntityIds.Audio_Mentions]: new AudioMessageSoundsSettingHandler<
        SOUNDS_LIST
      >(this._profileService, {
        id: SettingEntityIds.Audio_Mentions,
        setting_key: SETTING_KEYS.AUDIO_MENTIONS,
        source: SoundsList,
        defaultValue: SOUNDS_LIST.Bing_Bong,
      }),
      [SettingEntityIds.Audio_IncomingCalls]: new AudioPhoneSoundsSettingHandler<
        RINGS_LIST
      >(this._profileService, {
        id: SettingEntityIds.Audio_Mentions,
        setting_key: SETTING_KEYS.AUDIO_MENTIONS,
        source: RingsList,
        defaultValue: RINGS_LIST.High_Gong,
      }),
      [SettingEntityIds.Audio_NewVoicemail]: new AudioPhoneSoundsSettingHandler<
        SOUNDS_LIST
      >(this._profileService, {
        id: SettingEntityIds.Audio_NewVoicemail,
        setting_key: SETTING_KEYS.AUDIO_NEW_VOICEMAIL,
        source: SoundsList,
        defaultValue: SOUNDS_LIST.Ching,
      }),
    };
  }
}

export { ProfileSetting };
