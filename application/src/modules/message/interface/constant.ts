import { SettingEntityIds } from 'sdk/module/setting/moduleSetting/types';

const MESSAGE_SETTING_SCOPE = Symbol('MessageSetting');

enum MESSAGE_SETTING_ITEM {
  NOTIFICATION_DIRECT_MESSAGES = SettingEntityIds.Notification_DirectMessages,
  NOTIFICATION_NEW_MESSAGES = SettingEntityIds.Notification_NewMessages,
  NOTIFICATION_MENTIONS = SettingEntityIds.Notification_Mentions,
  NOTIFICATION_TEAMS = SettingEntityIds.Notification_Teams,
  NOTIFICATION_DAILY_DIGEST = SettingEntityIds.Notification_DailyDigest,
  NEW_MESSAGE_BADGE_COUNT = SettingEntityIds.Notification_NewMessageBadgeCount,
  SOUND_DIRECT_MESSAGES = SettingEntityIds.Audio_DirectMessage,
  SOUND_MENTIONS = SettingEntityIds.Audio_Mentions,
  SOUND_TEAM_MESSAGES = SettingEntityIds.Audio_TeamMessages,
  MAX_CONVERSATIONS = SettingEntityIds.Max_Conversations,
  SHOW_LINK_PREVIEWS = SettingEntityIds.Link_Preview,
}

export { MESSAGE_SETTING_SCOPE, MESSAGE_SETTING_ITEM };
