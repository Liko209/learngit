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
import { RTCEngine, RTC_MEDIA_ACTION } from 'voip';

import { TELEPHONY_KEYS } from '../../config/configKeys';
import { TelephonyUserConfig } from '../../config/TelephonyUserConfig';

export class MicrophoneSourceSettingHandler extends AbstractSettingEntityHandler<
  MediaDeviceInfo
> {
  id = SettingEntityIds.Phone_MicrophoneSource;

  constructor(
    private _userConfig: TelephonyUserConfig,
    private _rtcEngine: RTCEngine,
  ) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.on(RTC_MEDIA_ACTION.INPUT_DEVICE_LIST_CHANGED, this._onDevicesChange);
    this._userConfig.on(
      TELEPHONY_KEYS.CURRENT_MICROPHONE,
      this._onSelectedDeviceUpdate,
    );
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
    this._userConfig.off(
      TELEPHONY_KEYS.CURRENT_MICROPHONE,
      this._onSelectedDeviceUpdate,
    );
  }

  async updateValue(value: MediaDeviceInfo) {
    await this._userConfig.setCurrentMicrophone(value.deviceId);
  }

  async fetchUserSettingEntity() {
    const devices = this._rtcEngine.getAudioInputs();
    const settingItem: UserSettingEntity<MediaDeviceInfo> = {
      weight: 0,
      valueType: 0,
      parentModelId: 0,
      id: SettingEntityIds.Phone_MicrophoneSource,
      source: devices,
      value: devices.find(
        device => device.deviceId === this._userConfig.getCurrentMicrophone(),
      ),
      state: ESettingItemState.ENABLE,
      valueSetter: value => this.updateValue(value),
    };
    return settingItem;
  }
}
