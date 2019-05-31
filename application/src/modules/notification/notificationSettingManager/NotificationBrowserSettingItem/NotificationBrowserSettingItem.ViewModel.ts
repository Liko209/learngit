/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-30 09:29:55
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { UserSettingEntity } from 'sdk/module/setting';
import { getEntity } from '@/store/utils/entities';
import { ENTITY_NAME } from '@/store/constants';
import SettingModel from '@/store/models/UserSetting';
import { NotificationBrowserSettingItemViewProps } from './types';
import { SETTING_ITEM__NOTIFICATION_BROWSER } from '../constant';
import { DesktopNotificationsSettingModel as DNSM } from 'sdk/module/profile';

class NotificationBrowserSettingItemViewModel extends StoreViewModel
  implements NotificationBrowserSettingItemViewProps {
  @computed
  get settingItemEntity() {
    return getEntity<UserSettingEntity, SettingModel<Partial<DNSM>>>(
      ENTITY_NAME.USER_SETTING,
      SETTING_ITEM__NOTIFICATION_BROWSER,
    );
  }

  setToggleState = (checked: boolean) => {
    const { valueSetter } = this.settingItemEntity;
    valueSetter && valueSetter({ desktopNotifications: checked });
  }
}

export { NotificationBrowserSettingItemViewModel };
