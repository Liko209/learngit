/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 10:25:41
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { UserSettingEntity } from 'sdk/module/setting';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import SettingModel from '@/store/models/UserSetting';
import { i18nP } from '@/utils/i18nT';
import { E911SettingItemProps } from './types';
import { E911SettingInfo } from 'sdk/module/rcInfo/setting/types';
import { TelephonyService } from '@/modules/telephony/service';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { analyticsCollector } from '@/AnalyticsCollector';

class E911SettingItemViewModel extends StoreViewModel<E911SettingItemProps> {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  @computed
  get settingItemEntity() {
    return getEntity<UserSettingEntity, SettingModel<E911SettingInfo>>(
      ENTITY_NAME.USER_SETTING,
      this.props.id,
    );
  }

  @computed
  get showUserE911() {
    const settingItemEntity = this.settingItemEntity;
    if (!settingItemEntity.value) {
      return '';
    }
    const {
      city,
      country,
      state,
      street,
      street2,
      zip,
    } = settingItemEntity.value;

    // Foster City, CA, 94404, US
    const e911Address = [street, street2, city, state, zip, country]
      .filter((v: string) => v)
      .join(', ');

    return `${i18nP(
      'setting.phone.general.e911Setting.yourSavedAddressIs',
    )}${e911Address}`;
  }

  openE911 = () => {
    this._telephonyService.openE911();
    analyticsCollector.e911Setting();
  };
}

export { E911SettingItemViewModel };
