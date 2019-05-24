/*
 * @Author: Paynter Chen
 * @Date: 2019-05-24 13:33:49
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import {
  ESettingValueType,
  UserSettingEntity,
  AbstractUserSettingHandler,
} from 'sdk/module/setting';
import { SettingModuleIds } from 'sdk/module/setting/constants';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { PhoneNumberModel } from 'sdk/module/person/entity';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { NotificationEntityUpdatePayload } from 'sdk/service/notificationCenter';
import { SETTING_KEYS } from '../constants';
import { Profile } from '../entity';
import { IProfileService } from '../service/IProfileService';
import { AccountService } from 'sdk/module/account';

export class CallerIdSettingHandler extends AbstractUserSettingHandler<
  PhoneNumberModel
> {
  id = SettingModuleIds.CallerIdSetting.id;

  constructor(private _profileService: IProfileService) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.onEntity().onUpdate<Profile>('PROFILE', payload =>
      this.onProfileEntityUpdate(payload),
    );
  }

  async updateValue(record: PhoneNumberModel) {
    await this._profileService.updateSettingOptions([
      { key: SETTING_KEYS.DEFAULT_NUMBER, value: record.id },
    ]);
  }

  async getUserSettingEntity(disableCache: boolean = false) {
    if (!disableCache && this.userSettingEntityCache) {
      return this.userSettingEntityCache;
    }
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const callerList = await rcInfoService.getCallerIdList();
    const info = await this._profileService.getDefaultCaller();
    const settingItem: UserSettingEntity<PhoneNumberModel> = {
      weight: SettingModuleIds.CallerIdSetting.weight,
      valueType: ESettingValueType.OBJECT,
      parentModelId: SettingModuleIds.PhoneSetting_General.id,
      id: SettingModuleIds.CallerIdSetting.id,
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
      this.userSettingEntityCache.value && this.userSettingEntityCache.value.id;
    if (defaultCallerId !== lastNumberId) {
      this.notifyUserSettingEntityUpdate(await this.getUserSettingEntity());
    }
  }
}
