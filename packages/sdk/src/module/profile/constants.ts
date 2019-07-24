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

const AudioSourceUrl = 'https://d2rbro28ib85bu.cloudfront.net/audio/alerts/v1/';
type AUDIO_SOUNDS_INFO = {
  id: RINGS_TYPE | SOUNDS_TYPE;
  url: string;
};
const SoundsList: AUDIO_SOUNDS_INFO[] = [
  {
    url: `${AudioSourceUrl}${SOUNDS_TYPE.Double_Beeps}`,
    id: SOUNDS_TYPE.Double_Beeps,
  },
  {
    url: `${AudioSourceUrl}${SOUNDS_TYPE.Triple_Beeps}`,
    id: SOUNDS_TYPE.Triple_Beeps,
  },
  { url: `${AudioSourceUrl}${SOUNDS_TYPE.Alert}`, id: SOUNDS_TYPE.Alert },
  {
    url: `${AudioSourceUrl}${SOUNDS_TYPE.Alert_Double}`,
    id: SOUNDS_TYPE.Alert_Double,
  },
  {
    url: `${AudioSourceUrl}${SOUNDS_TYPE.Alert_Triple}`,
    id: SOUNDS_TYPE.Alert_Triple,
  },
  {
    url: `${AudioSourceUrl}${SOUNDS_TYPE.Bing_Bong}`,
    id: SOUNDS_TYPE.Bing_Bong,
  },
  { url: `${AudioSourceUrl}${SOUNDS_TYPE.Ching}`, id: SOUNDS_TYPE.Ching },
  { url: `${AudioSourceUrl}${SOUNDS_TYPE.Log_Drum}`, id: SOUNDS_TYPE.Log_Drum },
  { url: `${AudioSourceUrl}${SOUNDS_TYPE.Snap}`, id: SOUNDS_TYPE.Snap },
  { url: `${AudioSourceUrl}${SOUNDS_TYPE.Squirt}`, id: SOUNDS_TYPE.Squirt },
  { url: `${AudioSourceUrl}${SOUNDS_TYPE.Whoosh}`, id: SOUNDS_TYPE.Whoosh },
  {
    url: `${AudioSourceUrl}${SOUNDS_TYPE.Whoosh_Double}`,
    id: SOUNDS_TYPE.Whoosh_Double,
  },
  { url: `${AudioSourceUrl}${SOUNDS_TYPE.Off}`, id: SOUNDS_TYPE.Off },
];

const RingsList: AUDIO_SOUNDS_INFO[] = [
  {
    url: `${AudioSourceUrl}${RINGS_TYPE.Phone_Ring}`,
    id: RINGS_TYPE.Phone_Ring,
  },
  { url: `${AudioSourceUrl}${RINGS_TYPE.Air_Raid}`, id: RINGS_TYPE.Air_Raid },
  { url: `${AudioSourceUrl}${RINGS_TYPE.Allusive}`, id: RINGS_TYPE.Allusive },
  { url: `${AudioSourceUrl}${RINGS_TYPE.Attention}`, id: RINGS_TYPE.Attention },
  { url: `${AudioSourceUrl}${RINGS_TYPE.Blub_Blub}`, id: RINGS_TYPE.Blub_Blub },
  { url: `${AudioSourceUrl}${RINGS_TYPE.Buzzy}`, id: RINGS_TYPE.Buzzy },
  {
    url: `${AudioSourceUrl}${RINGS_TYPE.Channel_Open}`,
    id: RINGS_TYPE.Channel_Open,
  },
  { url: `${AudioSourceUrl}${RINGS_TYPE.Disco}`, id: RINGS_TYPE.Disco },
  { url: `${AudioSourceUrl}${RINGS_TYPE.Door_Bell}`, id: RINGS_TYPE.Door_Bell },
  { url: `${AudioSourceUrl}${RINGS_TYPE.Fairy}`, id: RINGS_TYPE.Fairy },
  {
    url: `${AudioSourceUrl}${RINGS_TYPE.Fast_Bells}`,
    id: RINGS_TYPE.Fast_Bells,
  },
  { url: `${AudioSourceUrl}${RINGS_TYPE.High_Gong}`, id: RINGS_TYPE.High_Gong },
  { url: `${AudioSourceUrl}${RINGS_TYPE.Indeed}`, id: RINGS_TYPE.Indeed },
  { url: `${AudioSourceUrl}${RINGS_TYPE.Nice}`, id: RINGS_TYPE.Nice },
  {
    url: `${AudioSourceUrl}${RINGS_TYPE.Ringing_Bells}`,
    id: RINGS_TYPE.Ringing_Bells,
  },
  { url: `${AudioSourceUrl}${RINGS_TYPE.Ring}`, id: RINGS_TYPE.Ring },
  { url: `${AudioSourceUrl}${RINGS_TYPE.Simple}`, id: RINGS_TYPE.Simple },
  { url: `${AudioSourceUrl}${RINGS_TYPE.Soothing}`, id: RINGS_TYPE.Soothing },
  { url: `${AudioSourceUrl}${RINGS_TYPE.Off}`, id: RINGS_TYPE.Off },
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
  AudioSourceUrl,
  RINGS_TYPE,
  SOUNDS_TYPE,
  RingsList,
  SoundsList,
};
