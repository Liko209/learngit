/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-02 14:56:36
 * Copyright © RingCentral. All rights reserved.
 */
import { notificationCenter, ENTITY, SERVICE } from 'sdk/service';
import { ESettingItemState } from 'sdk/framework/model/setting';
import {
  ModuleSettingTypes,
  UserSettingEntity,
  ESettingValueType,
} from '../entity';
import { RCInfoService } from '../../rcInfo';
import { ServiceConfig, ServiceLoader } from '../../serviceLoader';
import { ERCServiceFeaturePermission } from '../../rcInfo/types';
import { IUserModuleSetting } from './IUserModuleSetting';
import { SettingModuleIds } from '../constants';
import { SubscribeController } from 'sdk/module/base/controller/SubscribeController';

class PhoneModuleSetting extends SubscribeController
  implements IUserModuleSetting {
  constructor() {
    super({
      [SERVICE.TELEPHONY_SERVICE.VOIP_CALLING]: (enable: boolean) => {
        this.emitEntityChange(enable);
      },
    });

    this.subscribe();
  }

  dispose() {
    this.unsubscribe();
  }

  emitEntityChange = async (enable: boolean) => {
    const entity = await this.buildSettingItem();
    return notificationCenter.emitEntityUpdate(ENTITY.USER_SETTING, [entity]);
  }

  async buildSettingItem(): Promise<UserSettingEntity<ModuleSettingTypes>> {
    const state = await this._visibleState();
    return {
      state,
      id: SettingModuleIds.PhoneSetting.id,
      value: ModuleSettingTypes.PHONE,
      weight: SettingModuleIds.PhoneSetting.weight,
      valueType: ESettingValueType.SECTION,
    };
  }

  id() {
    return SettingModuleIds.PhoneSetting.id;
  }

  private async _visibleState() {
    const service = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    return service &&
      (await service.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.VOIP_CALLING,
      ))
      ? ESettingItemState.ENABLE
      : ESettingItemState.INVISIBLE;
  }

  getSections(): UserSettingEntity<number>[] {
    return [
      {
        id: SettingModuleIds.PhoneSetting_General.id,
        weight: SettingModuleIds.PhoneSetting_General.weight,
        state: ESettingItemState.ENABLE,
        parentModelId: SettingModuleIds.PhoneSetting.id,
        valueType: ESettingValueType.SECTION,
      },
      {
        id: SettingModuleIds.PhoneSetting_AudioSource.id,
        weight: SettingModuleIds.PhoneSetting_AudioSource.weight,
        state: ESettingItemState.ENABLE,
        parentModelId: SettingModuleIds.PhoneSetting.id,
        valueType: ESettingValueType.SECTION,
      },
    ];
  }
}

export { PhoneModuleSetting };
