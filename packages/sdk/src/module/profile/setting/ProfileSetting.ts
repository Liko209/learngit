/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-09 17:21:43
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { ESettingValueType, UserSettingEntity } from 'sdk/module/setting';
import { ENTITY } from 'sdk/service';
import { SettingModuleIds } from 'sdk/module/setting/constants';
import { SubscribeController } from 'sdk/module/base/controller/SubscribeController';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { PhoneNumberModel } from 'sdk/module/person/entity';
import { ESettingItemState } from 'sdk/framework/model/setting';
import notificationCenter, {
  NotificationEntityPayload,
} from 'sdk/service/notificationCenter';
import { SETTING_KEYS } from '../constants';
import { Profile } from '../entity';
import { IProfileService } from '../service/IProfileService';
import { EVENT_TYPES } from 'sdk/service/constants';
import { AccountService } from 'sdk/module/account';

enum EProfileSettingType {
  DEFAULT_CALLER = 'DEFAULT_CALLER',
}

const ParentIdMap = {
  [SettingModuleIds.PhoneSetting_General.id]: [
    EProfileSettingType.DEFAULT_CALLER,
  ],
};

class ProfileSetting extends SubscribeController {
  private _lastNumberSetting: UserSettingEntity<PhoneNumberModel>;
  private _glipProfileId: number;
  constructor(private _profileService: IProfileService) {
    super({
      [ENTITY.PROFILE]: (payload: NotificationEntityPayload<Profile>) => {
        this.handleProfileUpdated(payload);
      },
    });
    this.subscribe();
    const accountConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    this._glipProfileId = accountConfig.getCurrentUserProfileId();
  }

  handleProfileUpdated = async (
    payload: NotificationEntityPayload<Profile>,
  ) => {
    if (
      this._lastNumberSetting !== undefined &&
      this._glipProfileId &&
      payload.type === EVENT_TYPES.UPDATE
    ) {
      const profile = payload.body.entities.get(this._glipProfileId);
      if (!profile) {
        return;
      }
      const defaultCallerId = profile[SETTING_KEYS.DEFAULT_NUMBER];
      const lastNumberId =
        this._lastNumberSetting.value && this._lastNumberSetting.value.id;
      if (
        defaultCallerId !== undefined &&
        lastNumberId !== undefined &&
        defaultCallerId !== lastNumberId
      ) {
        const entity = await this._buildSettingEntityByType(
          EProfileSettingType.DEFAULT_CALLER,
        );
        entity &&
          notificationCenter.emitEntityUpdate(ENTITY.USER_SETTING, [entity]);
      }
    }
  }

  async getSettingsByParentId(settingId: number) {
    const settings = ParentIdMap[settingId];
    if (settings && settings.length) {
      const allSettings = settings.map((type: EProfileSettingType) => {
        return this._buildSettingEntityByType(type);
      });
      const settingEntities = await Promise.all(allSettings);

      return settingEntities.filter((x: UserSettingEntity<any> | undefined) => {
        return x !== undefined;
      }) as UserSettingEntity<any>[];
    }
    return [];
  }

  async getSettingById(settingId: number) {
    switch (settingId) {
      case SettingModuleIds.CallerIdSetting.id:
        return await this._buildSettingEntityByType(
          EProfileSettingType.DEFAULT_CALLER,
        );
    }
    return undefined;
  }

  private async _buildSettingEntityByType(type: EProfileSettingType) {
    switch (type) {
      case EProfileSettingType.DEFAULT_CALLER:
        return await this._getDefaultCallerSetting();
      default:
        break;
    }
    return undefined;
  }

  private async _getDefaultCallerSetting(): Promise<
    UserSettingEntity<PhoneNumberModel>
  > {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const callerList = await rcInfoService.getCallerIdList();
    const info = await this._profileService.getDefaultCaller();
    this._lastNumberSetting = {
      id: SettingModuleIds.CallerIdSetting.id,
      weight: SettingModuleIds.CallerIdSetting.weight,
      valueType: ESettingValueType.OBJECT,
      source: callerList,
      value: info,
      parentModelId: SettingModuleIds.PhoneSetting_General.id,
      state: ESettingItemState.ENABLE,
      valueSetter: async (record: PhoneNumberModel) => {
        await this._profileService.updateSettingOptions([
          { key: SETTING_KEYS.DEFAULT_NUMBER, value: record.id },
        ]);
      },
    };
    return this._lastNumberSetting;
  }
}

export { ProfileSetting };
