/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:38:10
 * Copyright © RingCentral. All rights reserved.
 */
import { action } from 'mobx';
import { BaseSettingItemViewModel } from '../Base/BaseSettingItem.ViewModel';
import { SliderSettingItem } from '@/interface/setting';
import _ from 'lodash';
import { dataTrackingForSetting } from '../utils/dataTrackingForSetting';
import { SliderSettingItemProps } from './types';

class SliderSettingItemViewModel extends BaseSettingItemViewModel<
  SliderSettingItemProps,
  SliderSettingItem
> {
  _dataTrackingDebounce: Function;
  @action
  saveSetting = async (newValue: number) => {
    const { valueSetter } = this.settingItemEntity;
    const { beforeSaving, dataTracking } = this.settingItem;
    if (beforeSaving) {
      const beforeSavingReturn = await beforeSaving(newValue);
      if (beforeSavingReturn === false) {
        return;
      }
    }
    valueSetter && valueSetter(newValue);
    if (dataTracking) {
      this._dataTrackingDebounce =
        this._dataTrackingDebounce ||
        _.debounce(() => dataTrackingForSetting(dataTracking, newValue), 1000);
      !dataTracking && this._dataTrackingDebounce();
    }
  }
}

export { SliderSettingItemViewModel };
