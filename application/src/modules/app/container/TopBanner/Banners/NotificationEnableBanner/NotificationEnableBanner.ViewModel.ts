/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-28 10:30:06
 * Copyright © RingCentral. All rights reserved.
 */
// alessia-todo
import { AbstractViewModel } from '@/base';
import { computed, observable, action } from 'mobx';
import { isElectron } from '@/common/isUserAgent';
// import { ENTITY_NAME } from '@/store';
// import { getEntity } from '@/store/utils';
// import { UserSettingEntity } from 'sdk/module/setting/entity';
// import SettingModel from '@/store/models/UserSetting';
import { PERMISSION } from '@/modules/notification/Permission';

// todo: import from sdk types
// const id = 1;
(<any>window).test = observable({
  value: {
    browserPermission: 'denied',
    wantNotifications: true,
  },
}) as any;

class NotificationEnableBannerViewModel extends AbstractViewModel {
  @observable
  private isClosed = false;

  @computed
  get notificationSettingItem() {
    return (<any>window).test;
    // return getEntity<UserSettingEntity, SettingModel>(
    //   ENTITY_NAME.USER_SETTING,
    //   id,
    // );
  }

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
