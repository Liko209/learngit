import { SettingEntityIds } from 'sdk/module/setting/moduleSetting/types';

const MESSAGE_SETTING_SCOPE = Symbol('MessageSetting');

enum MESSAGE_SETTING_ITEM {
  NOTIFICATION_DIRECT_MESSAGES = SettingEntityIds.Notification_DirectMessages,
  NOTIFICATION_NEW_MESSAGES = SettingEntityIds.Notification_NewMessages,
  NOTIFICATION_MENTIONS = SettingEntityIds.Notification_Mentions,
  NOTIFICATION_TEAMS = SettingEntityIds.Notification_Teams,
  NOTIFICATION_DAILY_DIGEST = SettingEntityIds.Notification_DailyDigest,
  NEW_MESSAGE_BADGE_COUNT = SettingEntityIds.Notification_NewMessageBadgeCount,
}

export { MESSAGE_SETTING_SCOPE, MESSAGE_SETTING_ITEM };
