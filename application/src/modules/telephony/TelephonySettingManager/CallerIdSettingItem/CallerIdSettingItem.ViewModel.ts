/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-08 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';
import { getEntity } from '@/store/utils';
import { IPhoneNumberRecord } from 'sdk/api/ringcentral/types/common';
import { ENTITY_NAME } from '@/store';
import { SettingItemProps } from '@/modules/setting/container/SettingItemBuild';

class CallerIdSettingItemViewModel extends StoreViewModel<
  SettingItemProps<IPhoneNumberRecord>
> {
  @computed
  get phoneNumber() {
    if (!this.props.value) return;

    let result: string = '';
    if (this.props.value.usageType !== 'Blocked') {
      result = getEntity(ENTITY_NAME.PHONE_NUMBER, this.props.value.phoneNumber)
        .formattedPhoneNumber;
    }
    return result;
  }
}

export { CallerIdSettingItemViewModel };
