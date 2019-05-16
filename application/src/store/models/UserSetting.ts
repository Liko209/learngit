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

export default class SettingModel extends Base<UserSettingEntity> {
  @observable
  valueType: ESettingValueType;
  @observable
  source?: any[];
  @observable
  value?: any;
  @observable
  weight: number;
  @observable
  state: ESettingItemState;
  @observable
  parentModelId?: number;
  @observable
  valueGetter?: () => Promise<any> | any;
  @observable
  valueSetter?: (value: any) => Promise<void> | void;

  constructor(data: UserSettingEntity) {
    super(data);
    const {
      valueType,
      source,
      value,
      weight,
      state,
      parentModelId,
      valueGetter,
      valueSetter,
    } = data;
    this.valueType = valueType;
    this.source = source;
    this.value = value;
    this.weight = weight;
    this.state = state;
    this.parentModelId = parentModelId;
    this.valueGetter = valueGetter;
    this.valueSetter = valueSetter;
  }

  static fromJS(data: UserSettingEntity) {
    return new SettingModel(data);
  }
}
