/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-02 13:56:44
 * Copyright © RingCentral. All rights reserved.
 */

import { SettingModuleIds } from 'sdk/module/setting/constants';
import { SubscribeController } from 'sdk/module/base/controller/SubscribeController';
import { RC_INFO, ENTITY } from 'sdk/service/eventKey';
import notificationCenter from 'sdk/service/notificationCenter';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { IRCInfoService } from '../service/IRCInfoService';
import { ERCWebSettingUri } from '../types';
import { ESettingValueType, UserSettingEntity } from '../../setting';
import { RegionSettingInfo } from './types';
enum ERcInfoSettingType {
  REGION_INFO = 'REGION_INFO',
  EXTENSION_SETTING = 'EXTENSION_SETTING',
}

const ParentIdMap = {
  [SettingModuleIds.PhoneSetting_General.id]: [
    ERcInfoSettingType.REGION_INFO,
    ERcInfoSettingType.EXTENSION_SETTING,
  ],
};

class RcInfoSettings extends SubscribeController {
  constructor(private _rcInfoService: IRCInfoService) {
    super({
      [RC_INFO.CLIENT_INFO]: () => {
        this._emitEntity(ERcInfoSettingType.EXTENSION_SETTING);
      },
      [RC_INFO.RC_REGION_INFO]: () => {
        this._emitEntity(ERcInfoSettingType.REGION_INFO);
      },
    });
    this.subscribe();
  }

  async getSettingById(id: number) {
    switch (id) {
      case SettingModuleIds.RegionSetting.id:
        return this._buildEntity(ERcInfoSettingType.REGION_INFO);
      case SettingModuleIds.ExtensionSetting.id:
        return this._buildEntity(ERcInfoSettingType.EXTENSION_SETTING);
      default:
        break;
    }
    return undefined;
  }

  async getSettingsByParentId(parentId: number) {
    const settings = ParentIdMap[parentId];
    if (settings && settings.length) {
      const allSettings = settings.map((type: ERcInfoSettingType) => {
        return this._buildEntity(type);
      });
      const settingEntities = await Promise.all(allSettings);

      return settingEntities.filter((x: UserSettingEntity<any> | undefined) => {
        return x !== undefined;
      }) as UserSettingEntity<any>[];
    }
    return [];
  }

  private async _emitEntity(type: ERcInfoSettingType) {
    const entity = (await this._buildEntity(type))!;
    return notificationCenter.emitEntityUpdate(ENTITY.USER_SETTING, [entity]);
  }

  private async _buildEntity(type: ERcInfoSettingType) {
    switch (type) {
      case ERcInfoSettingType.EXTENSION_SETTING:
        return await this._getExtensionSetting();
      case ERcInfoSettingType.REGION_INFO:
        return await this._getRegionSetting();
      default:
        break;
    }
    return undefined;
  }

  private async _getRegionSetting(): Promise<
    UserSettingEntity<RegionSettingInfo>
  > {
    const countryInfo = await this._rcInfoService.getCurrentCountry();
    const areaCode = await this._rcInfoService.getAreaCode();
    const visibleState = await this._getRegionSettingVisibleState(
      countryInfo.callingCode,
    );
    return {
      id: SettingModuleIds.RegionSetting.id,
      weight: SettingModuleIds.RegionSetting.weight,
      valueType: ESettingValueType.OBJECT,
      value: { countryInfo, areaCode },
      parentModelId: SettingModuleIds.PhoneSetting_General.id,
      state: visibleState,
    };
  }

  private _getExtensionSetting(): UserSettingEntity<string> {
    return {
      id: SettingModuleIds.ExtensionSetting.id,
      weight: SettingModuleIds.ExtensionSetting.weight,
      valueType: ESettingValueType.LINK,
      valueGetter: () => {
        return this._rcInfoService.generateWebSettingUri(
          ERCWebSettingUri.EXTENSION_URI,
        );
      },
      parentModelId: SettingModuleIds.PhoneSetting_General.id,
      state: ESettingItemState.ENABLE,
    };
  }

  private async _getRegionSettingVisibleState(
    countryCallingCode: string,
  ): Promise<ESettingItemState> {
    const countryList = await this._rcInfoService.getCountryList();
    if (!countryList || !countryList.length) {
      return ESettingItemState.DISABLE;
    }

    if (
      countryList.length === 1 &&
      !this._rcInfoService.hasAreaCode(countryCallingCode)
    ) {
      return ESettingItemState.DISABLE;
    }

    return ESettingItemState.ENABLE;
  }
}

export { RcInfoSettings };
