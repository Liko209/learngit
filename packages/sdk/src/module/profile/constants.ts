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

enum SETTING_KEYS {
  // call settings
  CALL_OPTION = 'calling_option',
  DEFAULT_NUMBER = 'default_number',

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
  NEW_MESSAGE_BADGES_OPTIONS,
};
