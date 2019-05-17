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
  get parsedSource() {
    const { source } = this.props;
    if (!source) return [];
    return source.map((oldItem, i) => {
      const item = { ...oldItem };
      const phoneNumber = oldItem.phoneNumber;
      if (item.usageType !== 'Blocked') {
        item.phoneNumber = getEntity(
          ENTITY_NAME.PHONE_NUMBER,
          phoneNumber,
        ).formattedPhoneNumber;
      }
      return item;
    });
  }
}

export { CallerIdSettingItemViewModel };
