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
  NOTIFICATION_OPTIONS,
  CALLING_OPTIONS,
} from '../../constants';
import { Profile } from '../../entity';
import { IProfileService } from '../../service/IProfileService';
import { ENTITY } from 'sdk/service';
import { AccountService } from 'sdk/module/account';
import { PlatformUtils } from 'sdk/utils/PlatformUtils';
import { DesktopNotificationsSettingModel as DNSM } from './NotificationsSettingHandler';

class IncomingCallsSettingHandler extends AbstractSettingEntityHandler<
  NOTIFICATION_OPTIONS
> {
  id = SettingEntityIds.Notification_IncomingCalls;

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
    this.onEntity().onUpdate<UserSettingEntity>(ENTITY.USER_SETTING, payload =>
      this.onSettingEntityUpdate(payload),
    );
  }

  async updateValue(value: NOTIFICATION_OPTIONS) {
    await this._profileService.updateSettingOptions([
      { value, key: SETTING_KEYS.DESKTOP_CALL },
    ]);
  }

  private async _getItemState(): Promise<ESettingItemState> {
    const profile = await this._profileService.getProfile();
    const model = await this._settingService.getById<DNSM>(
      SettingEntityIds.Notification_Browser,
    );
    const desktopNotifications =
      model && model.value && model.value.desktopNotifications;
    let state = ESettingItemState.ENABLE;
    if (!desktopNotifications && !PlatformUtils.isElectron()) {
      state = ESettingItemState.DISABLE;
    }
    if (profile[SETTING_KEYS.CALL_OPTION] === CALLING_OPTIONS.RINGCENTRAL) {
      state = ESettingItemState.INVISIBLE;
    }
    return state;
  }
  async fetchUserSettingEntity() {
    const settingItem: UserSettingEntity<NOTIFICATION_OPTIONS> = {
      weight: 1,
      valueType: 1,
      parentModelId: 1,
      value: await this._getDesktopCall(),
      source: [NOTIFICATION_OPTIONS.OFF, NOTIFICATION_OPTIONS.ON],
      id: SettingEntityIds.Notification_IncomingCalls,
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
    if (
      profile[SETTING_KEYS.DESKTOP_CALL] !== this.userSettingEntityCache.value
    ) {
      this.notifyUserSettingEntityUpdate(await this.getUserSettingEntity());
    }
  }
  async onSettingEntityUpdate(
    payload: NotificationEntityUpdatePayload<UserSettingEntity>,
  ) {
    if (
      payload.body.entities.has(SettingEntityIds.Notification_Browser) ||
      payload.body.entities.has(SettingEntityIds.Phone_DefaultApp)
    ) {
      this.notifyUserSettingEntityUpdate(await this.getUserSettingEntity());
    }
  }
  private async _getDesktopCall() {
    const profile = await this._profileService.getProfile();
    let desktopCall = profile[SETTING_KEYS.DESKTOP_CALL];
    if (desktopCall === undefined) {
      desktopCall = NOTIFICATION_OPTIONS.ON;
    }
    return desktopCall;
  }
}
export { IncomingCallsSettingHandler };
