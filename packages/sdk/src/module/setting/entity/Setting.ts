/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-02 13:48:31
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseSettingEntity } from 'sdk/framework/model/setting';

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
  valueType: ESettingValueType;
  source?: T[];
  value?: T;
  valueGetter?: () => Promise<T> | T;
  valueSetter?: (value: T) => Promise<void> | void;
};

export { UserSettingEntity, ESettingValueType, ModuleSettingTypes };
