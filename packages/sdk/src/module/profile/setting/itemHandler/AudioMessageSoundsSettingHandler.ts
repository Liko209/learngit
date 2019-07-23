/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-07-21 15:47:50
 * Copyright © RingCentral. All rights reserved.
 */

import {
  UserSettingEntity,
  AbstractSettingEntityHandler,
  SettingEntityIds,
} from 'sdk/module/setting';
import { NotificationEntityUpdatePayload } from 'sdk/service/notificationCenter';
import { ENTITY } from 'sdk/service';
import { SETTING_KEYS, SOUNDS_LIST } from 'sdk/module/profile/constants';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { IProfileService } from '../../service/IProfileService';
import { Profile } from '../../entity';
import { AccountService } from 'sdk/module/account';
import { SettingValue, SettingItemConfig } from '../../types';
import { SettingService } from '../../../setting';

class AudioMessageSoundsSettingHandler<
  T extends SettingValue
> extends AbstractSettingEntityHandler<T> {
  id: SettingEntityIds;
  setting_key: SETTING_KEYS;
  source?: T[];
  defaultValue?: T;
  constructor(
    private _profileService: IProfileService,
    settingEntity: SettingItemConfig<T>,
  ) {
    super();
    this.id = settingEntity.id;
    this.setting_key = settingEntity.setting_key;
    this.source = settingEntity.source;
    this.defaultValue = settingEntity.defaultValue;
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
    const settingItem: UserSettingEntity<T> = {
      weight: 1,
      valueType: 1,
      parentModelId: 1,
      id: this.id,
      source: this.source,
      value: await this._getValue() as T|undefined,
      state: ESettingItemState.ENABLE,
      valueSetter: value => this.updateValue(value),
    };
    return settingItem;
  }

  private async _getValue() {
    const profile = await this._profileService.getProfile();
    let value = profile
      ? profile[this.setting_key]
      : undefined;
    if (value === undefined) {
      value = this.defaultValue;
    }
    if (value === SOUNDS_LIST.Default) {
      const settingService = ServiceLoader.getInstance<SettingService>(
        ServiceConfig.SETTING_SERVICE,
      );
      const model = await settingService.getById<SOUNDS_LIST>(
        SettingEntityIds.Audio_TeamMessages,
      );
      value = model && model.value;
    }
    return value;
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
export { AudioMessageSoundsSettingHandler };
