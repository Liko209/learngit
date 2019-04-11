/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-10 11:38:28
 * Copyright © RingCentral. All rights reserved.
 */

import {
  CALLING_OPTIONS,
  EMAIL_NOTIFICATION_OPTIONS,
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  SETTING_KEYS,
} from './constants';

type SettingValue =
  | number
  | string
  | boolean
  | CALLING_OPTIONS
  | EMAIL_NOTIFICATION_OPTIONS
  | MOBILE_TEAM_NOTIFICATION_OPTIONS
  | DESKTOP_MESSAGE_NOTIFICATION_OPTIONS;

type SettingOption = {
  key: SETTING_KEYS;
  value: SettingValue;
};

export { SettingValue, SettingOption };
