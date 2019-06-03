/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-28 10:30:06
 * Copyright © RingCentral. All rights reserved.
 */
// alessia-todo: 合并后测试，删除注释掉的内容即可
import { AbstractViewModel } from '@/base';
import { computed, observable, action } from 'mobx';
import { isElectron } from '@/common/isUserAgent';
import { UserSettingEntity } from 'sdk/module/setting';
import { getEntity } from '@/store/utils/entities';
import { ENTITY_NAME } from '@/store/constants';
import SettingModel from '@/store/models/UserSetting';
import { PERMISSION } from '@/modules/notification/Permission';
import { DesktopNotificationsSettingModel as DNSM } from 'sdk/module/profile';
import { SETTING_ITEM__NOTIFICATION_BROWSER } from '@/modules/notification/notificationSettingManager/NotificationBrowserSettingItem/constants';

// const id = 1;
// (<any>window).test = observable({
//   value: {
//     browserPermission: 'denied',
//     wantNotifications: true,
//   },
// }) as any;

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

  // @computed
  // get notificationSettingItem() {
  //   return (<any>window).test;
  //   // return getEntity<UserSettingEntity, SettingModel>(
  //   //   ENTITY_NAME.USER_SETTING,
  //   //   id,
  //   // );
  // }

  @computed
  get isShow() {
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

  @computed
  get isBlocked() {
    const {
      value: { browserPermission },
    } = this.notificationSettingItem;
    return browserPermission === PERMISSION.DENIED;
  }

  @action
  handleClose = () => {
    this.isClosed = true;
  }
}

export { NotificationEnableBannerViewModel };
