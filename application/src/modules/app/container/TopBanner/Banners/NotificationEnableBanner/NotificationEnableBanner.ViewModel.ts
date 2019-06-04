/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-28 10:30:06
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractViewModel } from '@/base';
import { computed, observable, action } from 'mobx';
import { isElectron } from '@/common/isUserAgent';
import { UserSettingEntity } from 'sdk/module/setting';
import { getEntity } from '@/store/utils/entities';
import { ENTITY_NAME } from '@/store/constants';
import SettingModel from '@/store/models/UserSetting';
import { PERMISSION } from '@/modules/notification/Permission';
import { DesktopNotificationsSettingModel as DNSM } from 'sdk/module/profile';
import { SETTING_ITEM__NOTIFICATION_BROWSER } from '@/modules/notification/notificationSettingManager/constant';

class NotificationEnableBannerViewModel extends AbstractViewModel {
  @observable
  private isClosed = false;

  @computed
  get notificationSettingItem() {
    return getEntity<UserSettingEntity, SettingModel<Partial<DNSM>>>(
      ENTITY_NAME.USER_SETTING,
      SETTING_ITEM__NOTIFICATION_BROWSER,
    );
  }

  @computed
  get isShow() {
    if (this.notificationSettingItem.value) {
      const {
        value: { browserPermission, wantNotifications },
      } = this.notificationSettingItem;
      return (
        !this.isClosed &&
        !isElectron &&
        wantNotifications &&
        browserPermission !== PERMISSION.GRANTED
      );
    }
    return false;
  }

  @computed
  get isBlocked() {
    const browserPermission =
      this.notificationSettingItem.value &&
      this.notificationSettingItem.value.browserPermission;
    return browserPermission === PERMISSION.DENIED;
  }

  @action
  handleClose = () => {
    this.isClosed = true;
  }
}

export { NotificationEnableBannerViewModel };
