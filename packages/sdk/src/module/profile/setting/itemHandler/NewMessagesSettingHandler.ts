/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-28 16:45:30
 * Copyright © RingCentral. All rights reserved.
 */

import {
  UserSettingEntity,
  AbstractSettingEntityHandler,
  SettingEntityIds,
  SettingService,
} from 'sdk/module/setting';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { NotificationEntityUpdatePayload } from 'sdk/service/notificationCenter';
import {
  SETTING_KEYS,
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
} from '../../constants';
import { Profile } from '../../entity';
import { IProfileService } from '../../service/IProfileService';
import { ENTITY } from 'sdk/service';
import { AccountService } from 'sdk/module/account';
import { PlatformUtils } from 'sdk/utils/PlatformUtils';
import { DesktopNotificationsSettingModel as DNSM } from './NotificationsSettingHandler';

class NewMessagesSettingHandler extends AbstractSettingEntityHandler<
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS
> {
  id = SettingEntityIds.Notification_NewMessages;

  constructor(
    private _profileService: IProfileService,
    private _accountService: AccountService,
    private _settingService: SettingService,
  ) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.onEntity().onUpdate<Profile>(ENTITY.PROFILE, payload =>
      this.onProfileEntityUpdate(payload),
    );
  }

  async updateValue(value: DESKTOP_MESSAGE_NOTIFICATION_OPTIONS) {
    await this._profileService.updateSettingOptions([
      { value, key: SETTING_KEYS.DESKTOP_MESSAGE },
    ]);
  }
  private async _getItemState(): Promise<ESettingItemState> {
    const model = await this._settingService.getById<DNSM>(
      SettingEntityIds.Notification_Browser,
    );
    const desktopNotifications =
      model && model.value && model.value.desktopNotifications;
    if (!desktopNotifications && !PlatformUtils.isElectron()) {
      return ESettingItemState.DISABLE;
    }
    return ESettingItemState.ENABLE;
  }
  async fetchUserSettingEntity() {
    const profile = await this._profileService.getProfile();
    const settingItem: UserSettingEntity<
      DESKTOP_MESSAGE_NOTIFICATION_OPTIONS
    > = {
      weight: 1,
      valueType: 1,
      parentModelId: 1,
      source: [
        DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE,
        DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.DM_AND_MENTION,
        DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF,
      ],
      value: profile[SETTING_KEYS.DESKTOP_MESSAGE],
      id: SettingEntityIds.Notification_NewMessages,
      state: await this._getItemState(),
      valueSetter: value => this.updateValue(value),
    };
    return settingItem;
  }

  async onProfileEntityUpdate(
    payload: NotificationEntityUpdatePayload<Profile>,
  ) {
    const glipProfileId = this._accountService.userConfig.getCurrentUserProfileId();
    const profile = payload.body.entities.get(glipProfileId);
    if (!profile) {
      return;
    }
    const state = await this._getItemState();
    if (
      profile[SETTING_KEYS.DESKTOP_MESSAGE] !==
        this.userSettingEntityCache.value ||
      state !== this.userSettingEntityCache.state
    ) {
      this.notifyUserSettingEntityUpdate(await this.getUserSettingEntity());
    }
  }
}
export { NewMessagesSettingHandler };
