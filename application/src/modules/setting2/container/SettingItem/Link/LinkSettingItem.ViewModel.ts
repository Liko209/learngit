/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:38:10
 * Copyright © RingCentral. All rights reserved.
 */
import { LinkSettingItemProps } from './types';
import { BaseSettingItemViewModel } from '../Base/BaseSettingItem.ViewModel';

class LinkSettingItemViewModel extends BaseSettingItemViewModel<
  LinkSettingItemProps
> {
  getUrl = () => {
    const { value, valueGetter } = this.settingItemEntity;
    if (value) {
      return value;
    }
    if (valueGetter) {
      return valueGetter();
    }
    return '';
  }
}

export { LinkSettingItemViewModel };
