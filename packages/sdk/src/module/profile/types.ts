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
  SOUNDS_TYPE,
} from './constants';
import { SettingEntityIds } from '../setting';

type SettingValue =
  | number
  | string
  | boolean
  | CALLING_OPTIONS
  | EMAIL_NOTIFICATION_OPTIONS
  | MOBILE_TEAM_NOTIFICATION_OPTIONS
  | DESKTOP_MESSAGE_NOTIFICATION_OPTIONS
  | SOUNDS_TYPE;

type SettingOption = {
  key: SETTING_KEYS;
  value: SettingValue;
};

type SettingItemConfig<T> = {
  id: SettingEntityIds;
  setting_key: SETTING_KEYS;
  source?: T[];
  defaultValue?: T;
};

export { SettingValue, SettingOption, SettingItemConfig };
