/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:38:10
 * Copyright © RingCentral. All rights reserved.
 */
import { action } from 'mobx';
import { BaseSettingItemViewModel } from '../Base/BaseSettingItem.ViewModel';
import { SelectSettingItemProps } from './types';

class SelectSettingItemViewModel extends BaseSettingItemViewModel<
  SelectSettingItemProps
> {
  @action
  saveSetting = (valueId: string) => {
    const { valueSetter, source = [] } = this.settingItemEntity;
    const value = source.find(sourceItem => sourceItem.id === Number(valueId));
    return valueSetter && valueSetter(value);
  }
}

export { SelectSettingItemViewModel };
