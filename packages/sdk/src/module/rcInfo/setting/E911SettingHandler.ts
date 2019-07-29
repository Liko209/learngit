/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-07-23 11:15:03
 * Copyright © RingCentral. All rights reserved.
 */
import { ESettingItemState } from 'sdk/framework/model/setting';
import {
  AbstractSettingEntityHandler,
  ESettingValueType,
  SettingEntityIds,
  UserSettingEntity,
} from 'sdk/module/setting';
import { SettingModuleIds } from 'sdk/module/setting/constants';
import { EmergencyServiceAddress } from 'sdk/module/telephony/types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { TelephonyService } from 'sdk/module/telephony';
import { RCInfoService } from 'sdk/module/rcInfo';
import {
  IAssignLineRequest,
  IUpdateLineRequest,
  ERCServiceFeaturePermission,
} from 'sdk/module/rcInfo/types';
import { TelephonyGlobalConfig } from 'sdk/module/telephony/config/TelephonyGlobalConfig';
import { TELEPHONY_GLOBAL_KEYS } from 'sdk/module/telephony/config/configKeys';
import { mainLogger } from 'foundation';
import { notificationCenter } from 'sdk/service';
import { SERVICE, RC_INFO } from 'sdk/service/eventKey';

export class E911SettingHandler extends AbstractSettingEntityHandler<
  EmergencyServiceAddress
> {
  id = SettingEntityIds.Phone_E911;
  private _telephonyService: TelephonyService;
  private _rcInfoService: RCInfoService;

  constructor() {
    super();
    this._telephonyService = ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    );
    this._rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    this._subscribe();
  }

  private _emergencyAddressChanged = async () => {
    await this.getUserSettingEntity();
  };

  private _e911Updated = () => {
    notificationCenter.emit(SERVICE.RC_INFO_SERVICE.E911_UPDATED);
  };

  private _subscribe() {
    notificationCenter.on(
      `global.${TELEPHONY_GLOBAL_KEYS.EMERGENCY_ADDRESS}.*`,
      this._emergencyAddressChanged,
    );
    notificationCenter.on(
      SERVICE.TELEPHONY_SERVICE.SIP_PROVISION_UPDATED,
      this._e911Updated,
    );
    notificationCenter.on(RC_INFO.DEVICE_INFO, this._e911Updated);
  }

  private async _assignLine(emergencyAddress: EmergencyServiceAddress) {
    const line = await this._rcInfoService.getDigitalLines();
    const webPhoneId = this._telephonyService.getWebPhoneId();
    if (line.length && webPhoneId) {
      const deviceId: string = line[0].id;
      const assignLine: IAssignLineRequest = {
        emergencyServiceAddress: emergencyAddress,
        originalDeviceId: deviceId,
      };
      await this._rcInfoService.assignLine(webPhoneId, assignLine);
      TelephonyGlobalConfig.setEmergencyAddress(emergencyAddress);
    } else {
      mainLogger.warn(
        `Unable to assign line count: ${line.length} webPhoneId: ${webPhoneId}`,
      );
    }
  }

  private async _updateLine(emergencyAddress: EmergencyServiceAddress) {
    const webPhoneId = this._telephonyService.getWebPhoneId();
    if (webPhoneId) {
      const request: IUpdateLineRequest = {
        emergencyServiceAddress: emergencyAddress,
      };
      await this._rcInfoService.updateLine(webPhoneId, request);
      TelephonyGlobalConfig.setEmergencyAddress(emergencyAddress);
    } else {
      mainLogger.warn(`Unable to update line`);
    }
  }

  async updateValue(emergencyAddress: EmergencyServiceAddress) {
    const emergencyAddr = this._telephonyService.getRemoteEmergencyAddress();
    emergencyAddr
      ? this._updateLine(emergencyAddress)
      : this._assignLine(emergencyAddress);
  }

  async fetchUserSettingEntity() {
    return await this._getE911Setting();
  }

  async _getDefaultEmergencyAddress() {
    let emergencyAddr: EmergencyServiceAddress = {} as EmergencyServiceAddress;
    const localAddr = this._telephonyService.getLocalEmergencyAddress();
    if (localAddr) {
      emergencyAddr = localAddr;
    } else {
      const line = await this._rcInfoService.getDigitalLines();
      if (line.length) {
        emergencyAddr = line[0].emergencyServiceAddress;
      }
    }
    return emergencyAddr;
  }

  private async _getE911Setting(): Promise<
    UserSettingEntity<EmergencyServiceAddress>
  > {
    const hasCallPermission =
      (await this._rcInfoService.isVoipCallingAvailable()) &&
      (await this._rcInfoService.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.WEB_PHONE,
      ));
    const emergencyAddr = await this._getDefaultEmergencyAddress();
    return {
      id: SettingEntityIds.Phone_E911,
      value: emergencyAddr,
      weight: SettingModuleIds.ExtensionSetting.weight,
      valueType: ESettingValueType.LINK,
      parentModelId: SettingModuleIds.PhoneSetting_General.id,
      state:
        hasCallPermission
          ? ESettingItemState.ENABLE
          : ESettingItemState.INVISIBLE,
      valueSetter: value => this.updateValue(value),
    };
  }
}
