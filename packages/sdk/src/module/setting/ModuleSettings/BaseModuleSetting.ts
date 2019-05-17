/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-05 18:42:17
 * Copyright © RingCentral. All rights reserved.
 */

import {
  ModuleSettingTypes,
  UserSettingEntity,
  ESettingValueType,
} from '../entity';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { IUserModuleSetting } from './IUserModuleSetting';
class BaseModuleSetting implements IUserModuleSetting {
  constructor(
    private _id: number,
    private _weight: number,
    private _moduleType: ModuleSettingTypes,
  ) {}

  id() {
    return this._id;
  }

  buildSettingItem(): UserSettingEntity<ModuleSettingTypes> {
    return {
      id: this._id,
      value: this._moduleType,
      weight: this._weight,
      valueType: ESettingValueType.SECTION,
      state: ESettingItemState.ENABLE,
    };
  }

  getSections() {
    return [];
  }
}

export { BaseModuleSetting };
