/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-28 16:45:30
 * Copyright © RingCentral. All rights reserved.
 */

import {
  UserSettingEntity,
  AbstractSettingEntityHandler,
  SettingEntityIds,
} from 'sdk/module/setting';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { NotificationEntityUpdatePayload } from 'sdk/service/notificationCenter';
import {
  SETTING_KEYS,
  DesktopNotificationsSettingModel,
} from '../../constants';
import { Profile } from '../../entity';
import { IProfileService } from '../../service/IProfileService';
import { ENTITY, APPLICATION } from 'sdk/service';
import { Pal } from 'sdk/pal';
import { AccountService } from 'sdk/module/account';
import { PlatformUtils } from 'sdk/utils/PlatformUtils';
import { mainLogger } from 'foundation/log';

class NotificationsSettingHandler extends AbstractSettingEntityHandler<
  DesktopNotificationsSettingModel
> {
  id = SettingEntityIds.Notification_Browser;

  constructor(
    private _profileService: IProfileService,
    private _accountService: AccountService,
  ) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.onEntity().onUpdate<Profile>(ENTITY.PROFILE, payload =>
      this.onProfileEntityUpdate(payload),
    );
    this.on<NotificationPermission>(
      APPLICATION.NOTIFICATION_PERMISSION_CHANGE,
      payload => this.onNotificationPermissionUpdate(payload),
    );
  }

  async updateValue(model: Partial<DesktopNotificationsSettingModel>) {
    const { isGranted } = Pal.instance.getNotificationPermission();
    const profile = await this._profileService.getProfile();
    const wantNotifications = profile
      ? profile[SETTING_KEYS.DESKTOP_NOTIFICATION]
      : undefined;
    if (
      isGranted &&
      model.desktopNotifications !== undefined &&
      wantNotifications !== model.desktopNotifications
    ) {
      await this._profileService.updateSettingOptions([
        {
          key: SETTING_KEYS.DESKTOP_NOTIFICATION,
          value: model.desktopNotifications,
        },
      ]);
    }
  }

  async fetchUserSettingEntity() {
    const wantNotifications = await this._getWantNotifications();
    const { current, isGranted } = Pal.instance.getNotificationPermission();
    const value: DesktopNotificationsSettingModel = {
      wantNotifications,
      browserPermission: current,
      desktopNotifications: isGranted && wantNotifications ? true : false,
    };
    const settingItem: UserSettingEntity<DesktopNotificationsSettingModel> = {
      value,
      id: SettingEntityIds.Notification_Browser,
      state: PlatformUtils.isElectron()
        ? ESettingItemState.INVISIBLE
        : ESettingItemState.ENABLE,
      valueSetter: value => this.updateValue(value),
    };
    return settingItem;
  }
  async onNotificationPermissionUpdate(payload: NotificationPermission) {
    const lastPermission =
      this.userSettingEntityCache &&
      this.userSettingEntityCache.value &&
      this.userSettingEntityCache.value.browserPermission;
    if (payload !== lastPermission) {
      await this.getUserSettingEntity();
    }
  }

  async onProfileEntityUpdate(
    payload: NotificationEntityUpdatePayload<Profile>,
  ) {
    const glipProfileId = this._accountService.userConfig.getCurrentUserProfileId();
    const profile = payload.body.entities.get(glipProfileId);
    if (!profile) {
      return;
    }

    const lastPermission =
      this.userSettingEntityCache &&
      this.userSettingEntityCache.value &&
      this.userSettingEntityCache.value.wantNotifications;
    if (profile[SETTING_KEYS.DESKTOP_NOTIFICATION] !== lastPermission) {
      await this.getUserSettingEntity();
    }
  }
  private async _getWantNotifications() {
    const profile = await this._profileService.getProfile().catch(() => {
      mainLogger.warn('_getWantNotifications failed');
    });
    let wantNotifications = true;
    if (profile && profile.want_desktop_notifications !== undefined) {
      wantNotifications = profile.want_desktop_notifications;
    }
    return wantNotifications;
  }
}
export { NotificationsSettingHandler, DesktopNotificationsSettingModel };
