/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-02 13:48:31
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseSettingEntity } from 'sdk/framework/model/setting';
import {
  SOUNDS_TYPE,
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
  EMAIL_NOTIFICATION_OPTIONS,
} from 'sdk/module/profile';

enum ModuleSettingTypes {
  GENERAL,
  NOTIFICATION,
  MESSAGING,
  PHONE,
  MEETING,
  CALENDAR,
}

enum ESettingValueType {
  SECTION,
  SINGLE_VALUE,
  BOOLEAN,
  LINK,
  OBJECT,
}

type UserSettingEntity<T = any> = BaseSettingEntity & {
  source?: T[];
  value?: T;
  valueGetter?: () => Promise<T> | T;
  valueSetter?: (value: T) => Promise<void> | void;
};

type ConversationPreferenceModel = {
  muteAll: boolean;
  desktopNotification: boolean;
  soundNotification: SOUNDS_TYPE;
  mobileNotification: MOBILE_TEAM_NOTIFICATION_OPTIONS;
  emailNotification: EMAIL_NOTIFICATION_OPTIONS;
};

export {
  UserSettingEntity,
  ESettingValueType,
  ModuleSettingTypes,
  ConversationPreferenceModel,
};
