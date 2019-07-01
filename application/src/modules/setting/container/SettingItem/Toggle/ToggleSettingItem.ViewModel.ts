/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:38:10
 * Copyright © RingCentral. All rights reserved.
 */
import { action } from 'mobx';
import { BaseSettingItemViewModel } from '../Base/BaseSettingItem.ViewModel';
import {
  dataTrackingForSetting,
  booleanTransform,
} from '../utils/dataTrackingForSetting';
import { ToggleSettingItemProps } from './types';

class ToggleSettingItemViewModel extends BaseSettingItemViewModel<
  ToggleSettingItemProps
> {
  @action
  saveSetting = async (value: boolean) => {
    const { valueSetter } = this.settingItemEntity;
    const { beforeSaving, dataTracking } = this.settingItem;
    if (beforeSaving) {
      const beforeSavingReturn = await beforeSaving(value);
      if (beforeSavingReturn === false) {
        return;
      }
    }
    valueSetter && valueSetter(value);
    dataTracking &&
      dataTrackingForSetting(
        { ...dataTracking, optionTransform: () => booleanTransform(value) },
        value,
      );
  }
}

export { ToggleSettingItemViewModel };
