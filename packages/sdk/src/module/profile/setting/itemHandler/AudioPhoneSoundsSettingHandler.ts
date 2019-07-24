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
import {
  SETTING_KEYS,
  AUDIO_SOUNDS_INFO,
  SOUNDS_TYPE,
  RINGS_TYPE,
} from 'sdk/module/profile/constants';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { IProfileService } from '../../service/IProfileService';
import { Profile } from '../../entity';
import { AccountService } from 'sdk/module/account';
import { CALLING_OPTIONS } from '../../constants';
import { SettingService } from '../../../setting';

class AudioPhoneSoundsSettingHandler extends AbstractSettingEntityHandler<
  AUDIO_SOUNDS_INFO
> {
  id: SettingEntityIds;
  setting_key: SETTING_KEYS;
  source: AUDIO_SOUNDS_INFO[];
  defaultValue: SOUNDS_TYPE | RINGS_TYPE;
  constructor(
    private _profileService: IProfileService,
    settingEntity: {
      id: SettingEntityIds;
      setting_key: SETTING_KEYS;
      source: AUDIO_SOUNDS_INFO[];
      defaultValue: SOUNDS_TYPE | RINGS_TYPE;
    },
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
    this.onEntity().onUpdate<UserSettingEntity>(ENTITY.USER_SETTING, payload =>
      this.onSettingEntityUpdate(payload),
    );
  }

  async updateValue(value: AUDIO_SOUNDS_INFO) {
    await this._profileService.updateSettingOptions([
      { value: value.label, key: this.setting_key },
    ]);
  }
  async fetchUserSettingEntity() {
    const settingItem: UserSettingEntity<AUDIO_SOUNDS_INFO> = {
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
    return (model && model.value) === CALLING_OPTIONS.RINGCENTRAL
      ? ESettingItemState.INVISIBLE
      : ESettingItemState.ENABLE;
  }

  private async _getValue() {
    const profile = await this._profileService.getProfile();
    let value = profile ? profile[this.setting_key] : undefined;
    if (value === undefined) {
      value = this.defaultValue;
    }
    return this.source.find(item => item.label === value);
  }

  async onSettingEntityUpdate(
    payload: NotificationEntityUpdatePayload<UserSettingEntity>,
  ) {
    if (payload.body.entities.has(SettingEntityIds.Phone_DefaultApp)) {
      await this.getUserSettingEntity();
    }
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
