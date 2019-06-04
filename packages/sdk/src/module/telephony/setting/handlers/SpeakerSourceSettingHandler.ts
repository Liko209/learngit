/*
 * @Author: Paynter Chen
 * @Date: 2019-05-29 23:30:11
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { ESettingItemState } from 'sdk/framework/model/setting';
import {
  AbstractSettingEntityHandler,
  SettingEntityIds,
  UserSettingEntity,
} from 'sdk/module/setting';
import { RTC_MEDIA_ACTION, RTCEngine } from 'voip';

import { TELEPHONY_GLOBAL_KEYS } from '../../config/configKeys';
import { TelephonyGlobalConfig } from '../../config/TelephonyGlobalConfig';
import { RC_INFO, SERVICE } from 'sdk/service/eventKey';
import { isChrome } from './utils';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { ERCServiceFeaturePermission } from 'sdk/module/rcInfo/types';
import { ITelephonyService } from '../../service/ITelephonyService';

export class SpeakerSourceSettingHandler extends AbstractSettingEntityHandler<
  MediaDeviceInfo
> {
  id = SettingEntityIds.Phone_SpeakerSource;

  constructor(
    private _telephonyService: ITelephonyService,
    private _rtcEngine: RTCEngine,
  ) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.on(RC_INFO.EXTENSION_INFO, this._onPermissionChange);
    this.on(RC_INFO.ROLE_PERMISSIONS, this._onPermissionChange);
    this.on(SERVICE.TELEPHONY_SERVICE.VOIP_CALLING, this._onPermissionChange);
    this.on(RTC_MEDIA_ACTION.OUTPUT_DEVICE_LIST_CHANGED, this._onDevicesChange);
    TelephonyGlobalConfig.on(
      TELEPHONY_GLOBAL_KEYS.CURRENT_SPEAKER,
      this._onSelectedDeviceUpdate,
    );
  }

  private _getEntityState = async () => {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const isEnable =
      isChrome &&
      ((await this._telephonyService.getVoipCallPermission()) ||
        (await rcInfoService.isRCFeaturePermissionEnabled(
          ERCServiceFeaturePermission.VIDEO_CONFERENCING,
        )) ||
        (await rcInfoService.isRCFeaturePermissionEnabled(
          ERCServiceFeaturePermission.CONFERENCING,
        )));
    return isEnable ? ESettingItemState.ENABLE : ESettingItemState.INVISIBLE;
  }

  private _onPermissionChange = async () => {
    isChrome() &&
      this.notifyUserSettingEntityUpdate(await this.getUserSettingEntity());
  }

  private _onSelectedDeviceUpdate = (value: MediaDeviceInfo) => {
    if (
      this.userSettingEntityCache &&
      this.getCacheValue('deviceId') !== value.deviceId
    ) {
      this.getUserSettingEntity().then(entity =>
        this.notifyUserSettingEntityUpdate(entity),
      );
    }
  }

  private _onDevicesChange = async (devices: MediaDeviceInfo[]) => {
    this.notifyUserSettingEntityUpdate(await this.getUserSettingEntity());
  }

  dispose() {
    super.dispose();
    TelephonyGlobalConfig.off(
      TELEPHONY_GLOBAL_KEYS.CURRENT_SPEAKER,
      this._onSelectedDeviceUpdate,
    );
  }

  async updateValue(value: MediaDeviceInfo) {
    await TelephonyGlobalConfig.setCurrentSpeaker(value.deviceId);
  }

  async fetchUserSettingEntity() {
    const devices = this._rtcEngine.getAudioOutputs();
    const settingItem: UserSettingEntity<MediaDeviceInfo> = {
      weight: 0,
      valueType: 0,
      parentModelId: 0,
      id: SettingEntityIds.Phone_SpeakerSource,
      source: devices,
      value: devices.find(
        device => device.deviceId === TelephonyGlobalConfig.getCurrentSpeaker(),
      ),
      state: await this._getEntityState(),
      valueSetter: value => this.updateValue(value),
    };
    return settingItem;
  }
}
