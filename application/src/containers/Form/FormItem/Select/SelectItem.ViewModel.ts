/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-06 11:25:43
 * Copyright © RingCentral. All rights reserved.
 */

import { action, computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { SelectItemProps } from './types';

class SelectItemViewModel<T> extends StoreViewModel<SelectItemProps<T>> {
  @computed
  get disabled() {
    // return this.disabled !== undefined ? this.disabled : this.props.disabled;
    return this.props.disabled;
  }

  @computed
  get itemConfig() {
    return this.props.itemConfig;
  }

  @action
  saveValue = async (newValue: string) => {
    const { source = [], dataTrackingSender } = this.props;
    const rawValue = source.find(
      sourceItem => this.extractValue(sourceItem) === newValue,
    );
    const { beforeSaving, dataTracking, valueSetter } = this.itemConfig;
    if (beforeSaving) {
      const beforeSavingReturn = await beforeSaving(newValue);
      if (beforeSavingReturn === false) {
        return;
      }
    }
    valueSetter && (await valueSetter(rawValue));
    dataTracking && dataTrackingSender(dataTracking, rawValue);
  };

  // 是否需要发送 dataTracking，或者只是暂时保存数据

  extractValue = (sourceItem: T) => {
    const { valueExtractor } = this.itemConfig;
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
  };

  private _isObjectSourceItem(
    value: any,
  ): value is {
    id: number | string;
  } {
    return value && value.id !== undefined;
  }
}

export { SelectItemViewModel };
