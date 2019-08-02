/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-07 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import {
  UserSettingEntity,
  ESettingValueType,
} from 'sdk/module/setting/entity';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { observable } from 'mobx';
import Base from './Base';

export default class SettingModel<T = any> extends Base<UserSettingEntity<T>> {
  @observable
  valueType: ESettingValueType;
  @observable
  source?: T[];
  @observable
  value?: T;
  @observable
  weight: number;
  @observable
  state: ESettingItemState;
  @observable
  parentModelId?: number;
  @observable
  valueGetter?: () => Promise<T> | T;
  @observable
  valueSetter?: (value: T) => Promise<void> | void;

  constructor(data: UserSettingEntity) {
    super(data);
    const { source, value, state, valueGetter, valueSetter } = data;
    this.source = source;
    this.value = value;
    this.state = state;
    this.valueGetter = valueGetter;
    this.valueSetter = valueSetter;
  }

  static fromJS(data: UserSettingEntity) {
    return new SettingModel(data);
  }
}
