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
import { SETTING_KEYS } from 'sdk/module/profile/constants';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { IProfileService } from '../../service/IProfileService';
import { Profile } from '../../entity';
import { AccountService } from 'sdk/module/account';
import { SettingValue, SettingItemConfig } from '../../types';
import { UndefinedAble } from 'sdk/types';
import { CALLING_OPTIONS } from '../../constants';
import { SettingService } from '../../../setting';

class AudioPhoneSoundsSettingHandler<
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
      value: await this._getValue(),
      state: await this._getState(),
      valueSetter: value => this.updateValue(value),
    };
    return settingItem;
  }
  private async _getState() {
    const settingService = ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    );
    const model = await settingService.getById<CALLING_OPTIONS>(
      SettingEntityIds.Phone_DefaultApp,
    );
    return model && model.value === CALLING_OPTIONS.RINGCENTRAL
      ? ESettingItemState.INVISIBLE
      : ESettingItemState.ENABLE;
  }

  private async _getValue() {
    const profile = await this._profileService.getProfile();
    let value: UndefinedAble<T> = profile && profile[this.setting_key];
    if (value === undefined) {
      value = this.defaultValue;
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
export { AudioPhoneSoundsSettingHandler };
