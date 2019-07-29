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
  conversation_notifications,
} from '../constants';

type Profile = ExtendedBaseModel & {
  person_id?: number;
  favorite_group_ids: number[];
  favorite_post_ids: number[];
  skip_close_conversation_confirmation?: boolean;
  me_tab: boolean;
  conversation_level_notifications?: object;

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
};

export { Profile };
