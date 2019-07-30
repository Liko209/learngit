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
import { mainLogger } from 'foundation';
import { notificationCenter } from 'sdk/service';
import { SERVICE, RC_INFO } from 'sdk/service/eventKey';

export class E911SettingHandler extends AbstractSettingEntityHandler<
  EmergencyServiceAddress
> {
  id = SettingEntityIds.Phone_E911;
  private _e911UpdateEmitted = false;

  constructor() {
    super();
    this._subscribe();
  }

  private _emergencyAddressChanged = async () => {
    await this.getUserSettingEntity();
  };

  private _e911Updated = () => {
    const telephonyService = ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    );
    if (
      !telephonyService.isEmergencyAddrConfirmed() &&
      !this._e911UpdateEmitted
    ) {
      notificationCenter.emit(SERVICE.RC_INFO_SERVICE.E911_UPDATED);
      this._e911UpdateEmitted = true;
    }
  };

  private _subscribe() {
    const telephonyService = ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    );
    telephonyService.subscribeEmergencyAddressChange(
      this._emergencyAddressChanged,
    );
    telephonyService.subscribeSipProvChange(this._e911Updated);
    notificationCenter.on(RC_INFO.DEVICE_INFO, this._e911Updated);
  }

  private async _assignLine(emergencyAddress: EmergencyServiceAddress) {
    const telephonyService = ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    );
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const line = await rcInfoService.getDigitalLines();
    const webPhoneId = telephonyService.getWebPhoneId();
    if (line.length && webPhoneId) {
      const deviceId: string = line[0].id;
      const assignLine: IAssignLineRequest = {
        emergencyServiceAddress: emergencyAddress,
        originalDeviceId: deviceId,
      };
      await rcInfoService.assignLine(webPhoneId, assignLine);
      TelephonyGlobalConfig.setEmergencyAddress(emergencyAddress);
    } else {
      mainLogger.warn(
        `Unable to assign line count: ${line.length} webPhoneId: ${webPhoneId}`,
      );
    }
  }

  private async _updateLine(emergencyAddress: EmergencyServiceAddress) {
    const telephonyService = ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    );
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const webPhoneId = telephonyService.getWebPhoneId();
    if (webPhoneId) {
      const request: IUpdateLineRequest = {
        emergencyServiceAddress: emergencyAddress,
      };
      await rcInfoService.updateLine(webPhoneId, request);
      TelephonyGlobalConfig.setEmergencyAddress(emergencyAddress);
    } else {
      mainLogger.warn(`Unable to update line`);
    }
  }

  async updateValue(emergencyAddress: EmergencyServiceAddress) {
    const telephonyService = ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    );
    const localAddr = telephonyService.getLocalEmergencyAddress();
    const remoteAddr = telephonyService.getRemoteEmergencyAddress();
    !localAddr && !remoteAddr
      ? this._assignLine(emergencyAddress)
      : this._updateLine(emergencyAddress);
  }

  async fetchUserSettingEntity() {
    return await this._getE911Setting();
  }

  async _getDefaultEmergencyAddress() {
    let emergencyAddr: EmergencyServiceAddress = {} as EmergencyServiceAddress;
    const telephonyService = ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    );
    const localAddr = telephonyService.getLocalEmergencyAddress();
    if (localAddr) {
      emergencyAddr = localAddr;
    } else {
      const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
        ServiceConfig.RC_INFO_SERVICE,
      );
      const line = await rcInfoService.getDigitalLines();
      if (line.length) {
        emergencyAddr = line[0].emergencyServiceAddress;
      }
    }
    return emergencyAddr;
  }

  private async _getE911Setting(): Promise<
    UserSettingEntity<EmergencyServiceAddress>
  > {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const hasCallPermission =
      (await rcInfoService.isVoipCallingAvailable()) &&
      (await rcInfoService.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.WEB_PHONE,
      ));
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
