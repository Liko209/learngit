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
    const value = source.find(sourceItem => {
      if (typeof sourceItem === 'number') {
        return sourceItem === Number(valueId);
      }
      if (typeof sourceItem === 'string') {
        return sourceItem === valueId;
      }
      if (typeof sourceItem.id === 'number') {
        return sourceItem.id === Number(valueId);
      }
      if (typeof sourceItem.id === 'string') {
        return sourceItem.id === valueId;
      }
      throw new Error(
        'Error: Unknown source type, for special source type you must provide a transformFunc.',
      );
    });
    return valueSetter && valueSetter(value);
  }
}

export { SelectSettingItemViewModel };
