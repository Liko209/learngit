/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:38:10
 * Copyright © RingCentral. All rights reserved.
 */
import { action } from 'mobx';
import { BaseSettingItemViewModel } from '../Base/BaseSettingItem.ViewModel';
import { SliderSettingItem } from '@/interface/setting';
import { SliderSettingItemProps } from './types';

class SliderSettingItemViewModel extends BaseSettingItemViewModel<
  SliderSettingItemProps,
  SliderSettingItem
> {
  @action
  saveSetting = async (newValue: number) => {
    const { valueSetter } = this.settingItemEntity;
    const { beforeSavingAsync } = this.settingItem;
    let beforeSavingAsyncReturn = true;
    if (beforeSavingAsync) {
      beforeSavingAsyncReturn = await beforeSavingAsync(newValue);
    }
    return beforeSavingAsyncReturn && valueSetter && valueSetter(newValue);
  }
}

export { SliderSettingItemViewModel };
