/*
 * @Author: Paynter Chen
 * @Date: 2019-05-24 13:33:49
 * Copyright © RingCentral. All rights reserved.
 */
import {
  UserSettingEntity,
  AbstractSettingEntityHandler,
  SettingEntityIds,
} from 'sdk/module/setting';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { NotificationEntityUpdatePayload } from 'sdk/service/notificationCenter';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { ENTITY, SERVICE } from 'sdk/service';
import { CALLING_OPTIONS, SETTING_KEYS } from 'sdk/module/profile/constants';
import { TelephonyService } from 'sdk/module/telephony';
import { ProfileService } from 'sdk/module/profile';
import { Profile } from 'sdk/module/profile/entity';
import { GLIP_LOGIN_STATUS } from 'sdk/framework/account';

export class DefaultAppSettingHandler extends AbstractSettingEntityHandler<
  CALLING_OPTIONS
> {
  id = SettingEntityIds.Phone_DefaultApp;

  constructor() {
    super();
    this._subscribe();
  }

  get profileService() {
    return ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );
  }

  get accountService() {
    return ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
  }
  get telephonyService() {
    return ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    );
  }

  private _subscribe() {
    this.onEntity().onUpdate<Profile>(ENTITY.PROFILE, payload =>
      this.onProfileEntityUpdate(payload),
    );
    this.on(SERVICE.TELEPHONY_SERVICE.VOIP_CALLING, async () => {
      await this.getUserSettingEntity();
    });
    this.on(SERVICE.GLIP_LOGIN, async () => {
      await this.getUserSettingEntity();
    });
  }

  async updateValue(value: CALLING_OPTIONS) {
    await this.profileService.updateSettingOptions([
      { value, key: SETTING_KEYS.CALL_OPTION },
    ]);
  }

  async fetchUserSettingEntity() {
    const hasCallPermission = await this.telephonyService.getVoipCallPermission();
    const settingItem: UserSettingEntity<CALLING_OPTIONS> = {
      id: SettingEntityIds.Phone_DefaultApp,
      source: [CALLING_OPTIONS.GLIP, CALLING_OPTIONS.RINGCENTRAL],
      value: await this._getCallOption(),
      state: hasCallPermission
        ? ESettingItemState.ENABLE
        : ESettingItemState.INVISIBLE,
      valueSetter: value => this.updateValue(value),
    };
    return settingItem;
  }

  async onProfileEntityUpdate(
    payload: NotificationEntityUpdatePayload<Profile>,
  ) {
    const glipProfileId = this.accountService.userConfig.getCurrentUserProfileId();
    const profile = payload.body.entities.get(glipProfileId);
    if (!profile) {
      return;
    }
    if (
      profile[SETTING_KEYS.CALL_OPTION] !== this.userSettingEntityCache!.value
    ) {
      await this.getUserSettingEntity();
    }
  }
  private async _getCallOption() {
    const glipLoginStatus = this.accountService.getGlipLoginStatus();
    let callOption = CALLING_OPTIONS.GLIP;
    if (glipLoginStatus !== GLIP_LOGIN_STATUS.SUCCESS) {
      return callOption;
    }
    const profile = await this.profileService.getProfile();
    if (
      profile &&
      profile.calling_option !== undefined &&
      (profile.calling_option as string) !== ''
    ) {
      callOption = profile.calling_option;
    }
    return callOption;
  }
}
