/*
 * @Author: Paynter Chen
 * @Date: 2019-05-24 13:33:49
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import {
  ESettingValueType,
  UserSettingEntity,
  AbstractSettingEntityHandler,
  SettingEntityIds,
} from 'sdk/module/setting';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { NotificationEntityUpdatePayload } from 'sdk/service/notificationCenter';

import { AccountService } from 'sdk/module/account';
import { ENTITY, SERVICE } from 'sdk/service';
import { CALLING_OPTIONS, SETTING_KEYS } from 'sdk/module/profile/constants';
import { TelephonyService } from 'sdk/module/telephony';
import { IProfileService } from '../../service/IProfileService';
import { Profile } from '../../entity';

export class DefaultAppSettingHandler extends AbstractSettingEntityHandler<
  CALLING_OPTIONS
> {
  id = SettingEntityIds.Phone_DefaultApp;

  constructor(
    private _accountService: AccountService,
    private _profileService: IProfileService,
    private _telephonyService: TelephonyService,
  ) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.onEntity().onUpdate<Profile>(ENTITY.PROFILE, payload =>
      this.onProfileEntityUpdate(payload),
    );
    this.on(SERVICE.TELEPHONY_SERVICE.VOIP_CALLING, async () => {
      this.notifyUserSettingEntityUpdate(await this.getUserSettingEntity());
    });
  }

  async updateValue(value: CALLING_OPTIONS) {
    await this._profileService.updateSettingOptions([
      { value, key: SETTING_KEYS.CALL_OPTION },
    ]);
  }

  async fetchUserSettingEntity() {
    const hasCallPermission = await this._telephonyService.getVoipCallPermission();
    const settingItem: UserSettingEntity<CALLING_OPTIONS> = {
      weight: 0,
      valueType: ESettingValueType.OBJECT,
      parentModelId: 0,
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
    const glipProfileId = this._accountService.userConfig.getCurrentUserProfileId();
    const profile = payload.body.entities.get(glipProfileId);
    if (!profile) {
      return;
    }
    if (
      profile[SETTING_KEYS.CALL_OPTION] !== this.userSettingEntityCache!.value
    ) {
      this.notifyUserSettingEntityUpdate(await this.getUserSettingEntity());
    }
  }
  private async _getCallOption() {
    const profile = await this._profileService.getProfile();
    let callOption = profile[SETTING_KEYS.CALL_OPTION];
    if (callOption === undefined) {
      callOption = CALLING_OPTIONS.GLIP;
    }
    return callOption;
  }
}
