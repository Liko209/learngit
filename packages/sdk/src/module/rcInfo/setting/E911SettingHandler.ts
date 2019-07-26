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
import {
  EmergencyServiceAddress,
  SipProvisionInfo,
} from 'sdk/module/telephony/types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { TelephonyService } from 'sdk/module/telephony';
import { RCInfoService } from 'sdk/module/rcInfo';
import {
  IAssignLineRequest,
  IUpdateLineRequest,
} from 'sdk/module/rcInfo/types';
import { TelephonyGlobalConfig } from 'sdk/module/telephony/config/TelephonyGlobalConfig';

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

  private _subscribe() {
    // this.on<RCExtensionInfo>(RC_INFO.CLIENT_INFO, async () => {
    //   await this.getUserSettingEntity();
    // });
  }

  private async _assignLine(emergencyAddress: EmergencyServiceAddress) {
    const line = await this._rcInfoService.getDigitalLines();
    const sipProv:
      | SipProvisionInfo
      | undefined = this._telephonyService.getSipProvision();
    if (line.length && sipProv) {
      const webPhoneId: string = sipProv.device.id;
      const deviceId: string = line[0].id;
      const assignLine: IAssignLineRequest = {
        emergencyServiceAddress: emergencyAddress,
        originalDeviceId: deviceId,
      };
      await this._rcInfoService.assignLine(webPhoneId, assignLine);
      TelephonyGlobalConfig.setEmergencyAddress(emergencyAddress);
    }
  }

  private async _updateLine(emergencyAddress: EmergencyServiceAddress) {
    const sipProv:
      | SipProvisionInfo
      | undefined = this._telephonyService.getSipProvision();
    if (sipProv) {
      const webPhoneId = sipProv.device.id;
      const request: IUpdateLineRequest = {
        emergencyServiceAddress: emergencyAddress,
      };
      await this._rcInfoService.updateLine(webPhoneId, request);
      TelephonyGlobalConfig.setEmergencyAddress(emergencyAddress);
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
    const hasCallPermission = await this._rcInfoService.isVoipCallingAvailable();
    const emergencyAddr = await this._getDefaultEmergencyAddress();
    return {
      id: SettingEntityIds.Phone_E911,
      value: emergencyAddr,
      weight: SettingModuleIds.ExtensionSetting.weight,
      valueType: ESettingValueType.LINK,
      parentModelId: SettingModuleIds.PhoneSetting_General.id,
      state: hasCallPermission
        ? ESettingItemState.ENABLE
        : ESettingItemState.INVISIBLE,
      valueSetter: value => this.updateValue(value),
    };
  }
}
