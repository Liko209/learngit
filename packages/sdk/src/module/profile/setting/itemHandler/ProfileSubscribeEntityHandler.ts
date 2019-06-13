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
import { SETTING_KEYS } from 'sdk/module/profile/constants';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { IProfileService } from '../../service/IProfileService';
import { Profile } from '../../entity';
import { AccountService } from 'sdk/module/account';
import { SettingValue } from '../../types';
class ProfileSubscribeEntityHandler<
  T extends SettingValue
> extends AbstractSettingEntityHandler<T> {
  id: SettingEntityIds;
  setting_key: SETTING_KEYS;
  source?: T[];
  constructor(
    private _profileService: IProfileService,
    settingEntity: {
      id: SettingEntityIds;
      setting_key: SETTING_KEYS;
      source?: T[];
    },
  ) {
    super();
    this.id = settingEntity.id;
    this.setting_key = settingEntity.setting_key;
    this.source = settingEntity.source;
    this._subscribe();
  }

  private _subscribe() {
    this.onEntity().onUpdate<Profile>(ENTITY.PROFILE, payload =>
      this.onProfileEntityUpdate(payload),
    );
  }

  async updateValue(value: T) {
    await this._profileService.updateSettingOptions([
      { value, key: this.setting_key },
    ]);
  }
  async fetchUserSettingEntity() {
    const profile = await this._profileService.getProfile();
    const settingItem: UserSettingEntity<T> = {
      weight: 1,
      valueType: 1,
      parentModelId: 1,
      source: this.source,
      value: profile[this.setting_key] as T,
      id: this.id,
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
    if (profile[this.setting_key] !== this.userSettingEntityCache!.value) {
      await this.getUserSettingEntity();
    }
  }
}
export { ProfileSubscribeEntityHandler };
