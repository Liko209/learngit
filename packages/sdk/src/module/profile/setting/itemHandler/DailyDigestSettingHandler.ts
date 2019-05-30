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
import { NotificationEntityUpdatePayload } from 'sdk/service/notificationCenter';
import { ENTITY } from 'sdk/service';
import {
  NOTIFICATION_OPTIONS,
  SETTING_KEYS,
} from 'sdk/module/profile/constants';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { IProfileService } from '../../service/IProfileService';
import { Profile } from '../../entity';
import { AccountService } from 'sdk/module/account';
class DailyDigestSettingHandler extends AbstractSettingEntityHandler<
  NOTIFICATION_OPTIONS
> {
  id = SettingEntityIds.Notification_DailyDigest;

  constructor(private _profileService: IProfileService) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.onEntity().onUpdate<Profile>(ENTITY.PROFILE, payload =>
      this.onProfileEntityUpdate(payload),
    );
  }

  async updateValue(value: NOTIFICATION_OPTIONS) {
    await this._profileService.updateSettingOptions([
      { value, key: SETTING_KEYS.EMAIL_TODAY },
    ]);
  }
  async fetchUserSettingEntity() {
    const profile = await this._profileService.getProfile();
    const settingItem: UserSettingEntity<NOTIFICATION_OPTIONS> = {
      weight: 1,
      valueType: 1,
      parentModelId: 1,
      value: profile[SETTING_KEYS.EMAIL_TODAY],
      id: SettingEntityIds.Notification_DailyDigest,
      state: ESettingItemState.ENABLE,
      valueSetter: value => this.updateValue(value),
    };
    return settingItem;
  }

  async onProfileEntityUpdate(
    payload: NotificationEntityUpdatePayload<Profile>,
  ) {
    const accountConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const glipProfileId = accountConfig.getCurrentUserProfileId();
    const profile = payload.body.entities.get(glipProfileId);
    if (!profile) {
      return;
    }
    if (
      profile[SETTING_KEYS.EMAIL_TODAY] !== this.userSettingEntityCache.value
    ) {
      this.notifyUserSettingEntityUpdate(await this.getUserSettingEntity());
    }
  }
}
export { DailyDigestSettingHandler };
