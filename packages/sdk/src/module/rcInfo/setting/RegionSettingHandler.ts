/*
 * @Author: Paynter Chen
 * @Date: 2019-05-24 13:33:49
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { ESettingItemState } from 'sdk/framework/model/setting';
import {
  AbstractSettingEntityHandler,
  ESettingValueType,
  SettingEntityIds,
  UserSettingEntity,
} from 'sdk/module/setting';
import { SettingModuleIds } from 'sdk/module/setting/constants';
import { RC_INFO } from 'sdk/service';

import { IRCInfoService } from '../service/IRCInfoService';
import { RegionSettingInfo } from './types';

export class RegionSettingHandler extends AbstractSettingEntityHandler<
  RegionSettingInfo
> {
  id = SettingEntityIds.Phone_Region;

  constructor(private _rcInfoService: IRCInfoService) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.on(RC_INFO.RC_REGION_INFO, async () => {
      this.notifyUserSettingEntityUpdate(await this.getUserSettingEntity());
    });
  }

  async updateValue(value: RegionSettingInfo) {}

  async fetchUserSettingEntity() {
    return await this._getRegionSetting();
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
      id: SettingEntityIds.Phone_Region,
      weight: SettingModuleIds.RegionSetting.weight,
      valueType: ESettingValueType.OBJECT,
      value: { countryInfo, areaCode },
      parentModelId: SettingModuleIds.PhoneSetting_General.id,
      state: visibleState,
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
