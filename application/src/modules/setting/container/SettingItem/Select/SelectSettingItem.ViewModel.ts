/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:38:10
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed } from 'mobx';
import { BaseSettingItemViewModel } from '../Base/BaseSettingItem.ViewModel';
import { SelectSettingItem } from '@/interface/setting';
import { SelectSettingItemProps } from './types';

class SelectSettingItemViewModel<T> extends BaseSettingItemViewModel<
  SelectSettingItemProps,
  SelectSettingItem<T>
> {
  @computed
  get source() {
    let result: T[];
    if (
      this.settingItemEntity.source &&
      this.settingItemEntity.source.length > 0
    ) {
      result = this.settingItemEntity.source;
    } else {
      result = this.settingItem.defaultSource || [];
    }
    return result;
  }

  @computed
  get value() {
    return this.extractValue(this.settingItemEntity.value);
  }

  @action
  saveSetting = (newValue: string) => {
    const { valueSetter, source = [] } = this.settingItemEntity;
    const rawValue = source.find(
      sourceItem => this.extractValue(sourceItem) === newValue,
    );
    return valueSetter && valueSetter(rawValue);
  }

  extractValue = (sourceItem: T) => {
    const { valueExtractor } = this.settingItem;
    let result: string | number;
    if (valueExtractor) {
      result = valueExtractor(sourceItem);
    } else if (
      typeof sourceItem === 'string' ||
      typeof sourceItem === 'number'
    ) {
      result = sourceItem;
    } else if (this._isObjectSourceItem(sourceItem)) {
      result = sourceItem.id;
    } else if (sourceItem === undefined) {
      result = '';
    } else {
      throw new Error('Error: Can not extract value of source');
    }
    return result.toString();
  }

  private _isObjectSourceItem(
    value: any,
  ): value is {
    id: number | string;
  } {
    return value && value.id !== undefined;
  }
}

export { SelectSettingItemViewModel };
