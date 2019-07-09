/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-06-21 14:51:38
 * Copyright © RingCentral. All rights reserved.
 */

import { ESettingItemState } from 'sdk/framework/model/setting';
import {
  AbstractSettingEntityHandler,
  SettingEntityIds,
  UserSettingEntity,
} from 'sdk/module/setting';
import { RTC_MEDIA_ACTION } from 'voip';

import { TELEPHONY_GLOBAL_KEYS } from '../../config/configKeys';
import { TelephonyGlobalConfig } from '../../config/TelephonyGlobalConfig';
import { RC_INFO, SERVICE } from 'sdk/service/eventKey';
import { isChrome } from './utils';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { ERCServiceFeaturePermission } from 'sdk/module/rcInfo/types';
import { ITelephonyService } from '../../service/ITelephonyService';

export class RingerSourceSettingHandler extends AbstractSettingEntityHandler<
MediaDeviceInfo
> {
  id = SettingEntityIds.Phone_RingerSource;

  constructor(private _telephonyService: ITelephonyService) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.on(RC_INFO.EXTENSION_INFO, this._onPermissionChange);
    this.on(RC_INFO.ROLE_PERMISSIONS, this._onPermissionChange);
    this.on(SERVICE.TELEPHONY_SERVICE.VOIP_CALLING, this._onPermissionChange);
    this.on(RTC_MEDIA_ACTION.OUTPUT_DEVICE_LIST_CHANGED, this._onDevicesChange);
    TelephonyGlobalConfig.on(
      TELEPHONY_GLOBAL_KEYS.CURRENT_RINGER,
      this._onSelectedDeviceUpdate,
    );
  }

  private _getEntityState = async (devices: MediaDeviceInfo[]) => {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    let state = ESettingItemState.ENABLE;
    if (!devices.length) {
      state = ESettingItemState.DISABLE;
    }
    const isEnable =
      isChrome() &&
      ((await this._telephonyService.getVoipCallPermission()) ||
        (await rcInfoService.isRCFeaturePermissionEnabled(
          ERCServiceFeaturePermission.VIDEO_CONFERENCING,
        )) ||
        (await rcInfoService.isRCFeaturePermissionEnabled(
          ERCServiceFeaturePermission.CONFERENCING,
        )));
    if (!isEnable) {
      state = ESettingItemState.INVISIBLE;
    }
    return state;
  };

  private _onPermissionChange = async () => {
    isChrome() && (await this.getUserSettingEntity());
  };

  private _onSelectedDeviceUpdate = (type: number, value: string) => {
    if (
      this.userSettingEntityCache &&
      this.userSettingEntityCache.value &&
      this.userSettingEntityCache.value.deviceId !== value
    ) {
      this.getUserSettingEntity();
    }
  };

  private _onDevicesChange = async () => {
    await this.getUserSettingEntity();
  };

  dispose() {
    super.dispose();
    TelephonyGlobalConfig.off(
      TELEPHONY_GLOBAL_KEYS.CURRENT_RINGER,
      this._onSelectedDeviceUpdate,
    );
  }

  async updateValue(value: MediaDeviceInfo) {
    await TelephonyGlobalConfig.setCurrentRinger(value.deviceId);
  }

  async fetchUserSettingEntity() {
    const devices = this._telephonyService.getRingerDevicesList();
    const settingItem: UserSettingEntity<MediaDeviceInfo> = {
      weight: 0,
      valueType: 0,
      parentModelId: 0,
      id: SettingEntityIds.Phone_RingerSource,
      source: devices,
      value: devices.find(
        device => device.deviceId === TelephonyGlobalConfig.getCurrentRinger(),
      ),
      state: await this._getEntityState(devices),
      valueSetter: value => this.updateValue(value),
    };
    return settingItem;
  }
}
