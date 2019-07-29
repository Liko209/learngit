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
import { SETTING_KEYS, AUDIO_SOUNDS_INFO } from 'sdk/module/profile/constants';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { IProfileService } from '../../service/IProfileService';
import { Profile } from '../../entity';
import { AccountService } from 'sdk/module/account';
import { SoundsList, SOUNDS_TYPE } from '../../constants';

class AudioTeamMessagesSettingHandler extends AbstractSettingEntityHandler<
  AUDIO_SOUNDS_INFO
> {
  id = SettingEntityIds.Audio_TeamMessages;
  settingId = SETTING_KEYS.AUDIO_TEAM_MESSAGES;
  constructor(private _profileService: IProfileService) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.onEntity().onUpdate<Profile>(ENTITY.PROFILE, payload =>
      this.onProfileEntityUpdate(payload),
    );
  }

  async updateValue(value: AUDIO_SOUNDS_INFO) {
    await this._profileService.updateSettingOptions([
      { value: value.id, key: this.settingId },
    ]);
  }
  async fetchUserSettingEntity() {
    const settingItem: UserSettingEntity<AUDIO_SOUNDS_INFO> = {
      weight: 1,
      valueType: 1,
      parentModelId: 1,
      source: SoundsList,
      id: this.id,
      value: await this._getValue(),
      state: ESettingItemState.ENABLE,
      valueSetter: value => this.updateValue(value),
    };
    return settingItem;
  }
  private async _getValue() {
    const profile = this._profileService.getProfile();
    let value = profile ? profile[this.settingId] : undefined;
    if (value === undefined) {
      value = SOUNDS_TYPE.Log_Drum;
    }
    return SoundsList.find(item => item.id === value);
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
      profile[this.settingId] !==
      (this.userSettingEntityCache &&
        this.userSettingEntityCache.value &&
        this.userSettingEntityCache.value.id)
    ) {
      await this.getUserSettingEntity();
    }
  }
}
export { AudioTeamMessagesSettingHandler };
