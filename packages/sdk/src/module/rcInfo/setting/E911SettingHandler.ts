/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-07-23 11:15:03
 * Copyright © RingCentral. All rights reserved.
 */
import { ESettingItemState } from 'sdk/framework/model/setting';
import {
  AbstractSettingEntityHandler,
  SettingEntityIds,
  UserSettingEntity,
} from 'sdk/module/setting';
import { EmergencyServiceAddress } from 'sdk/module/telephony/types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { TelephonyService } from 'sdk/module/telephony';
import { RCInfoService } from 'sdk/module/rcInfo';
import {
  IAssignLineRequest,
  IUpdateLineRequest,
  ERCServiceFeaturePermission,
} from 'sdk/module/rcInfo/types';
import { mainLogger } from 'foundation/log';
import { notificationCenter } from 'sdk/service';
import { SERVICE, RC_INFO } from 'sdk/service/eventKey';

export class E911SettingHandler extends AbstractSettingEntityHandler<
  EmergencyServiceAddress
> {
  id = SettingEntityIds.Phone_E911;
  private _isSipReady = false;
  private _e911UpdateEmitted = false;

  constructor() {
    super();
    this._subscribe();
  }

  private _emergencyAddressChanged = async () => {
    await this.getUserSettingEntity();
  };

  private _e911Updated = async () => {
    if (!this._isSipReady) {
      return;
    }
    const telephonyService = ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    );
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const lines = await rcInfoService.getDigitalLines();
    const hasDL = lines && lines.length;
    if (
      !this._e911UpdateEmitted &&
      hasDL &&
      !telephonyService.isEmergencyAddrConfirmed()
    ) {
      this._e911UpdateEmitted = true;
      notificationCenter.emit(SERVICE.RC_INFO_SERVICE.E911_UPDATED);
    }
  };

  private _onSipProvReceived = async () => {
    this._isSipReady = true;
    this._emergencyAddressChanged();
    this._e911Updated();
  };

  private _onEAUpdated = () => {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    mainLogger.info('DL is removed');
    rcInfoService.DBConfig.setDeviceInfo({});
  };

  private _subscribe() {
    const telephonyService = ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    );
    telephonyService.subscribeEmergencyAddressChange(
      this._emergencyAddressChanged,
    );
    telephonyService.subscribeSipProvEAUpdated(this._onEAUpdated);
    notificationCenter.on(RC_INFO.DEVICE_INFO, () => {
      this._emergencyAddressChanged();
      this._e911Updated();
    });
    telephonyService.subscribeSipProvReceived(this._onSipProvReceived);
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
      telephonyService.setLocalEmergencyAddress(emergencyAddress);
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
      telephonyService.updateLocalEmergencyAddress(emergencyAddress);
    } else {
      mainLogger.warn(`Unable to update line`);
    }
  }

  async updateValue(emergencyAddress: EmergencyServiceAddress) {
    const telephonyService = ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    );
    const remoteAddr = telephonyService.getRemoteEmergencyAddress();
    !remoteAddr
      ? await this._assignLine(emergencyAddress)
      : await this._updateLine(emergencyAddress);
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
      const remoteAddr = telephonyService.getRemoteEmergencyAddress();
      emergencyAddr = localAddr;
      if (
        remoteAddr &&
        !telephonyService.isAddressEqual(remoteAddr, localAddr)
      ) {
        mainLogger.info('Prefer remote EA when it is not equal to local EA');
        emergencyAddr = remoteAddr;
      }
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
    const lines = await rcInfoService.getDigitalLines();
    const hasDL = lines && lines.length;
    const emergencyAddr = await this._getDefaultEmergencyAddress();
    return {
      id: SettingEntityIds.Phone_E911,
      value: emergencyAddr,
      state:
        hasCallPermission && hasDL
          ? ESettingItemState.ENABLE
          : ESettingItemState.INVISIBLE,
      valueSetter: value => this.updateValue(value),
    };
  }
}
