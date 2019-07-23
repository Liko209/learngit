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

enum MOBILE_TEAM_NOTIFICATION_OPTIONS {
  FIRST_UNREAD_ONLY = 'firstonly',
  EVERY_MESSAGE = '1',
  OFF = '0',
}

enum DESKTOP_MESSAGE_NOTIFICATION_OPTIONS {
  ALL_MESSAGE = 'always',
  DM_AND_MENTION = 'mentions_or_dms',
  OFF = 'never',
}

enum RINGS_TYPE {
  Phone_Ring = 'Phone Ring',
  Air_Raid = 'Air Raid',
  Allusive = 'Allusive',
  Attention = 'Attention',
  Blub_Blub = 'Blub Blub',
  Buzzy = 'Buzzy',
  Channel_Open = 'Channel Open',
  Disco = 'Disco',
  Door_Bell = 'Door Bell',
  Fairy = 'Fairy',
  Fast_Bells = 'Fast Bells',
  High_Gong = 'High Gong',
  Indeed = 'Indeed',
  Nice = 'Nice',
  Ringing_Bells = 'Ringing Bells',
  Ring = 'Ring',
  Simple = 'Simple',
  Soothing = 'Soothing',
  Off = 'Off',
}

enum SOUNDS_TYPE {
  Double_Beeps = '2 Beeps',
  Triple_Beeps = '3 Beeps',
  Alert = 'Alert',
  Alert_Double = 'Alert 2',
  Alert_Triple = 'Alert 3',
  Bing_Bong = 'Bing Bong',
  Ching = 'Ching',
  Log_Drum = 'Log Drum',
  Snap = 'Snap',
  Squirt = 'Squirt',
  Whoosh = 'Whoosh',
  Whoosh_Double = 'Whoosh 2',
  Off = 'Off',
  Default = 'Default',
}

const AudioSourceUrl = 'https://d2rbro28ib85bu.cloudfront.net/audio/alerts/v1/';
type AUDIO_SOUNDS_INFO = {
  label: RINGS_TYPE | SOUNDS_TYPE;
  url: string;
};
const SoundsList: AUDIO_SOUNDS_INFO[] = [
  { url: `${AudioSourceUrl}2Beep.wav`, label: SOUNDS_TYPE.Double_Beeps },
  { url: `${AudioSourceUrl}3Beep.wav`, label: SOUNDS_TYPE.Triple_Beeps },
  { url: `${AudioSourceUrl}Alert1.wav`, label: SOUNDS_TYPE.Alert },
  { url: `${AudioSourceUrl}Alert2.wav`, label: SOUNDS_TYPE.Alert_Double },
  { url: `${AudioSourceUrl}Alert3.wav`, label: SOUNDS_TYPE.Alert_Triple },
  { url: `${AudioSourceUrl}BingBong.wav`, label: SOUNDS_TYPE.Bing_Bong },
  { url: `${AudioSourceUrl}Ching.wav`, label: SOUNDS_TYPE.Ching },
  { url: `${AudioSourceUrl}LogDrum2.wav`, label: SOUNDS_TYPE.Log_Drum },
  { url: `${AudioSourceUrl}Snap.wav`, label: SOUNDS_TYPE.Snap },
  { url: `${AudioSourceUrl}Button9.wav`, label: SOUNDS_TYPE.Squirt },
  { url: `${AudioSourceUrl}Whoosh.wav`, label: SOUNDS_TYPE.Whoosh },
  { url: `${AudioSourceUrl}Whoosh2.wav`, label: SOUNDS_TYPE.Whoosh_Double },
  { url: `${AudioSourceUrl}default`, label: SOUNDS_TYPE.Default },
  { url: `${AudioSourceUrl}0`, label: SOUNDS_TYPE.Off },
];

const RingsList: AUDIO_SOUNDS_INFO[] = [
  { url: `${AudioSourceUrl}PhoneRing.wav`, label: RINGS_TYPE.Phone_Ring },
  { url: `${AudioSourceUrl}air-raid-ring.wav`, label: RINGS_TYPE.Air_Raid },
  { url: `${AudioSourceUrl}allusive-ring.wav`, label: RINGS_TYPE.Allusive },
  { url: `${AudioSourceUrl}attention-ring.wav`, label: RINGS_TYPE.Attention },
  { url: `${AudioSourceUrl}blub-blub-ring.wav`, label: RINGS_TYPE.Blub_Blub },
  { url: `${AudioSourceUrl}buzzy-ring.wav`, label: RINGS_TYPE.Buzzy },
  {
    url: `${AudioSourceUrl}communication-channel-ring.wav`,
    label: RINGS_TYPE.Channel_Open,
  },
  { url: `${AudioSourceUrl}disco-ring.wav`, label: RINGS_TYPE.Disco },
  { url: `${AudioSourceUrl}door-bell-ring.wav`, label: RINGS_TYPE.Door_Bell },
  { url: `${AudioSourceUrl}fab-ring.wav`, label: RINGS_TYPE.Fairy },
  { url: `${AudioSourceUrl}fast-bells-ring.wav`, label: RINGS_TYPE.Fast_Bells },
  { url: `${AudioSourceUrl}high-gong-ring.wav`, label: RINGS_TYPE.High_Gong },
  { url: `${AudioSourceUrl}indeed-ring.wav`, label: RINGS_TYPE.Indeed },
  { url: `${AudioSourceUrl}nice-ring.wav`, label: RINGS_TYPE.Nice },
  {
    url: `${AudioSourceUrl}ringing-bells-ring.wav`,
    label: RINGS_TYPE.Ringing_Bells,
  },
  { url: `${AudioSourceUrl}ring-ring.wav`, label: RINGS_TYPE.Ring },
  { url: `${AudioSourceUrl}simple-ring.wav`, label: RINGS_TYPE.Simple },
  { url: `${AudioSourceUrl}soothing-ring.wav`, label: RINGS_TYPE.Soothing },
  { url: `${AudioSourceUrl}0`, label: RINGS_TYPE.Off },
];

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

  // sound settings
  AUDIO_TEAM_MESSAGES = 'want_audio_notifications',
  AUDIO_DIRECT_MESSAGES = 'one_on_one_audio_notifications',
  AUDIO_MENTIONS = 'at_mention_audio_notifications',
  AUDIO_INCOMING_CALLS = 'phone_audio_notifications',
  AUDIO_NEW_VOICEMAIL = 'meeting_audio_notifications',
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
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  SETTING_KEYS,
  NEW_MESSAGE_BADGES_OPTIONS,
  DesktopNotificationsSettingModel,
  AUDIO_SOUNDS_INFO,
  RINGS_TYPE,
  SOUNDS_TYPE,
  RingsList,
  SoundsList,
};
