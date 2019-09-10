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
import {
  CONVERSATION_NOTIFICATIONS_VALUE,
  AUDIO_NOTIFICATIONS,
  Profile,
} from './entity/Profile';
import { Nullable } from 'sdk/types';

type SettingValue =
  | number
  | string
  | boolean
  | CALLING_OPTIONS
  | EMAIL_NOTIFICATION_OPTIONS
  | MOBILE_TEAM_NOTIFICATION_OPTIONS
  | DESKTOP_MESSAGE_NOTIFICATION_OPTIONS
  | SOUNDS_TYPE
  | CONVERSATION_NOTIFICATIONS_VALUE
  | AUDIO_NOTIFICATIONS[];

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
interface IProfileObservable {
  register(observer: IProfileObserver): void;
  unRegister(observer: IProfileObserver): void;
  notify(
    observer: IProfileObserver,
    profile: Profile,
    originProfile: Nullable<Profile>,
  ): void;
}
interface IProfileObserver {
  keys: SETTING_KEYS[];
  update(profile: Profile, originProfile: Nullable<Profile>): Promise<void>;
}

export {
  SettingValue,
  SettingOption,
  SettingItemConfig,
  IProfileObservable,
  IProfileObserver,
};
