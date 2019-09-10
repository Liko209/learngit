/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:38:10
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { BaseSettingItemViewModel } from '../Base/BaseSettingItem.ViewModel';
import { SelectSettingItem } from '@/interface/setting';
import { dataTrackingForSetting } from '../utils/dataTrackingForSetting';
import { SelectSettingItemProps } from './types';
import { catchError } from '@/common/catchError';

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
    return this.settingItemEntity.value;
  }

  @catchError.flash({
    network: 'setting.errorText.network',
    server: 'setting.errorText.server',
  })
  saveSetting = async (newValue: string, rawValue: T) => {
    const { valueSetter } = this.settingItemEntity;
    const { beforeSaving, dataTracking } = this.settingItem;
    if (beforeSaving) {
      const beforeSavingReturn = await beforeSaving(newValue);
      if (beforeSavingReturn === false) {
        return;
      }
    }
    valueSetter && (await valueSetter(rawValue));
    dataTracking && dataTrackingForSetting(dataTracking, rawValue);
  };
}

export { SelectSettingItemViewModel };
