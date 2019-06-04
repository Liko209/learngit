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
import { SettingModuleIds } from 'sdk/module/setting/constants';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { PhoneNumberModel } from 'sdk/module/person/entity';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { NotificationEntityUpdatePayload } from 'sdk/service/notificationCenter';

import { AccountService } from 'sdk/module/account';
import { ENTITY } from 'sdk/service';
import { Profile } from '../../entity';
import { IProfileService } from '../../service/IProfileService';
import { SETTING_KEYS } from 'sdk/module/profile/constants';

export class CallerIdSettingHandler extends AbstractSettingEntityHandler<
  PhoneNumberModel
> {
  id = SettingEntityIds.Phone_CallerId;

  constructor(private _profileService: IProfileService) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.onEntity().onUpdate<Profile>(ENTITY.PROFILE, payload =>
      this.onProfileEntityUpdate(payload),
    );
  }

  async updateValue(record: PhoneNumberModel) {
    await this._profileService.updateSettingOptions([
      { key: SETTING_KEYS.DEFAULT_NUMBER, value: record.id },
    ]);
  }

  async fetchUserSettingEntity() {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const callerList = await rcInfoService.getCallerIdList();
    const info = await this._profileService.getDefaultCaller();
    const settingItem: UserSettingEntity<PhoneNumberModel> = {
      weight: SettingModuleIds.CallerIdSetting.weight,
      valueType: ESettingValueType.OBJECT,
      parentModelId: SettingModuleIds.PhoneSetting_General.id,
      id: SettingEntityIds.Phone_CallerId,
      source: callerList,
      value: info,
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
    const defaultCallerId = profile[SETTING_KEYS.DEFAULT_NUMBER];
    const lastNumberId =
      this.userSettingEntityCache &&
      this.userSettingEntityCache.value &&
      this.userSettingEntityCache.value.id;
    if (defaultCallerId !== lastNumberId) {
      this.notifyUserSettingEntityUpdate(await this.getUserSettingEntity());
    }
  }
}
