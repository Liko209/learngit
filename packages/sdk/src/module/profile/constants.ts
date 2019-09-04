/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-08 15:20:42
 * Copyright © RingCentral. All rights reserved.
 */

enum CALLING_OPTIONS {
  GLIP = 'glip',
  RINGCENTRAL = 'ringcentral',
}
enum NEW_MESSAGE_BADGES_OPTIONS {
  GROUPS_AND_MENTIONS = 'groups_and_mentions',
  ALL = 'all',
}

enum NOTIFICATION_OPTIONS {
  OFF = 0,
  ON = 1,
}

enum EMAIL_NOTIFICATION_OPTIONS {
  EVERY_HOUR = '3600000',
  EVERY_15_MESSAGE = '900000',
  OFF = '0',
}
const emailNotificationList = [
  EMAIL_NOTIFICATION_OPTIONS.EVERY_15_MESSAGE,
  EMAIL_NOTIFICATION_OPTIONS.EVERY_HOUR,
  EMAIL_NOTIFICATION_OPTIONS.OFF,
];

enum MOBILE_TEAM_NOTIFICATION_OPTIONS {
  FIRST_UNREAD_ONLY = 'firstonly',
  EVERY_MESSAGE = '1',
  OFF = '0',
}

const mobileTeamNotificationList = [
  MOBILE_TEAM_NOTIFICATION_OPTIONS.EVERY_MESSAGE,
  MOBILE_TEAM_NOTIFICATION_OPTIONS.FIRST_UNREAD_ONLY,
  MOBILE_TEAM_NOTIFICATION_OPTIONS.OFF,
];

const mobileDMNotificationList = [
  MOBILE_TEAM_NOTIFICATION_OPTIONS.EVERY_MESSAGE,
  MOBILE_TEAM_NOTIFICATION_OPTIONS.OFF,
];

enum DESKTOP_MESSAGE_NOTIFICATION_OPTIONS {
  ALL_MESSAGE = 'always',
  DM_AND_MENTION = 'mentions_or_dms',
  OFF = 'never',
}

enum VIDEO_SERVICE_OPTIONS {
  RINGCENTRAL_MEETINGS = 'ringcentral_meetings',
  RINGCENTRAL_MEETINGS_EMBEDDED = 'ringcentral_meetings_embedded',
  RINGCENTRAL_VIDEO = 'ringcentral_video',
  RINGCENTRAL_VIDEO_EMBEDDED = 'ringcentral_video_embedded',
}

enum RINGS_TYPE {
  Phone_Ring = 'PhoneRing.wav',
  Air_Raid = 'air-raid-ring.wav',
  Allusive = 'allusive-ring.wav',
  Attention = 'attention-ring.wav',
  Blub_Blub = 'blub-blub-ring.wav',
  Buzzy = 'buzzy-ring.wav',
  Channel_Open = 'communication-channel-ring.wav',
  Disco = 'disco-ring.wav',
  Door_Bell = 'door-bell-ring.wav',
  Fairy = 'fab-ring.wav',
  Fast_Bells = 'fast-bells-ring.wav',
  High_Gong = 'high-gong-ring.wav',
  Indeed = 'indeed-ring.wav',
  Nice = 'nice-ring.wav',
  Ringing_Bells = 'ringing-bells-ring.wav',
  Ring = 'ring-ring.wav',
  Simple = 'simple-ring.wav',
  Soothing = 'soothing-ring.wav',
  Off = '0',
}

enum SOUNDS_TYPE {
  Double_Beeps = '2Beep.wav',
  Triple_Beeps = '3Beep.wav',
  Alert = 'Alert1.wav',
  Alert_Double = 'Alert2.wav',
  Alert_Triple = 'Alert3.wav',
  Bing_Bong = 'BingBong.wav',
  Ching = 'Ching.wav',
  Log_Drum = 'LogDrum2.wav',
  Snap = 'Snap.wav',
  Squirt = 'Button9.wav',
  Whoosh = 'Whoosh.wav',
  Whoosh_Double = 'Whoosh2.wav',
  Default = 'default',
  Off = '0',
}

const AudioSourceUrl = '/audio/alerts/v1/';
type AUDIO_SOUNDS_INFO = {
  id: RINGS_TYPE | SOUNDS_TYPE;
  url: string;
};

const ringsTypeList: RINGS_TYPE[] = [
  RINGS_TYPE.Phone_Ring,
  RINGS_TYPE.Air_Raid,
  RINGS_TYPE.Allusive,
  RINGS_TYPE.Attention,
  RINGS_TYPE.Blub_Blub,
  RINGS_TYPE.Buzzy,
  RINGS_TYPE.Channel_Open,
  RINGS_TYPE.Disco,
  RINGS_TYPE.Door_Bell,
  RINGS_TYPE.Fairy,
  RINGS_TYPE.Fast_Bells,
  RINGS_TYPE.High_Gong,
  RINGS_TYPE.Indeed,
  RINGS_TYPE.Nice,
  RINGS_TYPE.Ringing_Bells,
  RINGS_TYPE.Ring,
  RINGS_TYPE.Simple,
  RINGS_TYPE.Soothing,
  RINGS_TYPE.Off,
];

const soundsTypeList = [
  SOUNDS_TYPE.Double_Beeps,
  SOUNDS_TYPE.Triple_Beeps,
  SOUNDS_TYPE.Alert,
  SOUNDS_TYPE.Alert_Double,
  SOUNDS_TYPE.Alert_Triple,
  SOUNDS_TYPE.Bing_Bong,
  SOUNDS_TYPE.Ching,
  SOUNDS_TYPE.Log_Drum,
  SOUNDS_TYPE.Snap,
  SOUNDS_TYPE.Squirt,
  SOUNDS_TYPE.Whoosh,
  SOUNDS_TYPE.Whoosh_Double,
  SOUNDS_TYPE.Off,
];

const SoundsList = soundsTypeList.map(id => ({
  id,
  url: `${AudioSourceUrl}${id}`,
}));

const RingsList = ringsTypeList.map(id => ({
  id,
  url: `${AudioSourceUrl}${id}`,
}));

const SoundsListWithDefault = [
  { id: SOUNDS_TYPE.Default, url: `${AudioSourceUrl}${SOUNDS_TYPE.Default}` },
  ...SoundsList,
];
const MAX_LEFTRAIL_GROUP_MAX_VALUE = 59;
const MAX_LEFTRAIL_GROUP_DEFAULT_VALUE = 10;
const MAX_LEFTRAIL_GROUP_VALUE_LIST: number[] = Array.from(
  { length: MAX_LEFTRAIL_GROUP_MAX_VALUE },
  (v, k) => k + 2,
);

enum SETTING_KEYS {
  // call settings
  CALL_OPTION = 'calling_option',
  DEFAULT_NUMBER = 'default_number',
  LAST_READ_MISSED = 'last_read_missed',

  // mobile settings
  MOBILE_DM = 'want_push_people',
  MOBILE_TEAM = 'want_push_team',
  MOBILE_MENTION = 'want_push_mentions',
  MOBILE_CALL_INFO = 'want_push_faxes',
  MOBILE_VIDEO = 'want_push_video_chat',

  // email settings
  EMAIL_DM = 'want_email_people',
  EMAIL_TEAM = 'want_email_team',
  EMAIL_MENTION = 'want_email_mentions',
  EMAIL_TODAY = 'want_email_glip_today',

  // desktop settings
  DESKTOP_NOTIFICATION = 'want_desktop_notifications',
  DESKTOP_MESSAGE = 'desktop_notifications_new_messages',
  DESKTOP_CALL = 'desktop_notifications_incoming_calls',
  DESKTOP_VOICEMAIL = 'desktop_notifications_new_voicemails',

  // conversation settings
  MAX_LEFTRAIL_GROUP = 'max_leftrail_group_tabs2',
  NEW_MESSAGE_BADGES = 'new_message_badges',
  SHOW_LINK_PREVIEWS = 'show_link_previews',

  // sound settings
  AUDIO_TEAM_MESSAGES = 'want_audio_notifications',
  AUDIO_DIRECT_MESSAGES = 'one_on_one_audio_notifications',
  AUDIO_MENTIONS = 'at_mention_audio_notifications',
  AUDIO_INCOMING_CALLS = 'phone_audio_notifications',
  AUDIO_NEW_VOICEMAIL = 'meeting_audio_notifications',

  CONVERSATION_NOTIFICATION = 'conversation_level_notifications',
  CONVERSATION_AUDIO = 'team_specific_audio_notifications',
}
type DesktopNotificationsSettingModel = {
  browserPermission: NotificationPermission;
  wantNotifications: boolean;
  desktopNotifications: boolean;
};

export {
  CALLING_OPTIONS,
  NOTIFICATION_OPTIONS,
  EMAIL_NOTIFICATION_OPTIONS,
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
  emailNotificationList,
  mobileTeamNotificationList,
  mobileDMNotificationList,
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  SETTING_KEYS,
  NEW_MESSAGE_BADGES_OPTIONS,
  DesktopNotificationsSettingModel,
  AUDIO_SOUNDS_INFO,
  AudioSourceUrl,
  RINGS_TYPE,
  SOUNDS_TYPE,
  RingsList,
  SoundsList,
  SoundsListWithDefault,
  VIDEO_SERVICE_OPTIONS,
  MAX_LEFTRAIL_GROUP_DEFAULT_VALUE,
  MAX_LEFTRAIL_GROUP_VALUE_LIST,
};
