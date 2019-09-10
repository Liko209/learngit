/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 14:53:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ExtendedBaseModel } from '../../models';
import {
  CALLING_OPTIONS,
  NOTIFICATION_OPTIONS,
  EMAIL_NOTIFICATION_OPTIONS,
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  SETTING_KEYS,
  NEW_MESSAGE_BADGES_OPTIONS,
  AUDIO_SOUNDS_INFO,
  SOUNDS_TYPE,
  RINGS_TYPE,
} from '../constants';
import { IdModel } from 'sdk/framework/model';

type CONVERSATION_NOTIFICATIONS_VALUE = {
  [groupId: number]: {
    muted?: boolean;
    desktop_notifications?: boolean;
    push_notifications?: MOBILE_TEAM_NOTIFICATION_OPTIONS;
    email_notifications?: EMAIL_NOTIFICATION_OPTIONS;
  };
};

type AUDIO_NOTIFICATIONS = {
  gid: number;
  sound: SOUNDS_TYPE | RINGS_TYPE;
};

type Profile = ExtendedBaseModel & {
  person_id?: number;
  favorite_group_ids: number[];
  favorite_post_ids: number[];
  skip_close_conversation_confirmation?: boolean;
  me_tab: boolean;

  // call settings
  [SETTING_KEYS.CALL_OPTION]?: CALLING_OPTIONS;
  [SETTING_KEYS.DEFAULT_NUMBER]?: number;
  [SETTING_KEYS.LAST_READ_MISSED]?: number;

  // mobile settings
  [SETTING_KEYS.MOBILE_DM]?: NOTIFICATION_OPTIONS;
  [SETTING_KEYS.MOBILE_TEAM]?: MOBILE_TEAM_NOTIFICATION_OPTIONS;
  [SETTING_KEYS.MOBILE_MENTION]?: NOTIFICATION_OPTIONS;
  [SETTING_KEYS.MOBILE_CALL_INFO]?: NOTIFICATION_OPTIONS;
  [SETTING_KEYS.MOBILE_VIDEO]?: NOTIFICATION_OPTIONS;

  // email settings
  [SETTING_KEYS.EMAIL_DM]?: EMAIL_NOTIFICATION_OPTIONS;
  [SETTING_KEYS.EMAIL_TEAM]?: EMAIL_NOTIFICATION_OPTIONS;
  [SETTING_KEYS.EMAIL_MENTION]?: NOTIFICATION_OPTIONS;
  [SETTING_KEYS.EMAIL_TODAY]?: NOTIFICATION_OPTIONS;

  // desktop settings
  [SETTING_KEYS.DESKTOP_NOTIFICATION]?: boolean;
  [SETTING_KEYS.DESKTOP_MESSAGE]?: DESKTOP_MESSAGE_NOTIFICATION_OPTIONS;
  [SETTING_KEYS.DESKTOP_CALL]?: NOTIFICATION_OPTIONS;
  [SETTING_KEYS.DESKTOP_VOICEMAIL]?: NOTIFICATION_OPTIONS;
  [SETTING_KEYS.NEW_MESSAGE_BADGES]?: NEW_MESSAGE_BADGES_OPTIONS;

  // conversation settings
  [SETTING_KEYS.MAX_LEFTRAIL_GROUP]?: string;
  [SETTING_KEYS.CONVERSATION_NOTIFICATION]?: CONVERSATION_NOTIFICATIONS_VALUE;
  [SETTING_KEYS.CONVERSATION_AUDIO]?: AUDIO_NOTIFICATIONS[];
  [SETTING_KEYS.SHOW_LINK_PREVIEWS]: boolean;

  // meetings
  video_service?: string;
  rcv_beta?: boolean;
};
type ConversationPreference = IdModel<number> & {
  muted: boolean;
  desktopNotifications: boolean;
  audioNotifications: AUDIO_SOUNDS_INFO;
  pushNotifications: MOBILE_TEAM_NOTIFICATION_OPTIONS;
  emailNotifications: EMAIL_NOTIFICATION_OPTIONS;
};

export {
  Profile,
  ConversationPreference,
  CONVERSATION_NOTIFICATIONS_VALUE,
  AUDIO_NOTIFICATIONS,
};
