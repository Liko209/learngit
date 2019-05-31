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

import { TELEPHONY_KEYS } from '../../config/configKeys';
import { TelephonyUserConfig } from '../../config/TelephonyUserConfig';

export class SpeakerSourceSettingHandler extends AbstractSettingEntityHandler<
  MediaDeviceInfo
> {
  id = SettingEntityIds.Phone_SpeakerSource;

  constructor(
    private _userConfig: TelephonyUserConfig,
    private _rtcEngine: RTCEngine,
  ) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.on(RTC_MEDIA_ACTION.OUTPUT_DEVICES_CHANGED, this._onDevicesChange);
    this._userConfig.on(
      TELEPHONY_KEYS.CURRENT_SPEAKER,
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
      TELEPHONY_KEYS.CURRENT_SPEAKER,
      this._onSelectedDeviceUpdate,
    );
  }

  async updateValue(value: MediaDeviceInfo) {
    await this._userConfig.setCurrentSpeaker(value.deviceId);
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
        device => device.deviceId === this._userConfig.getCurrentSpeaker(),
      ),
      state: ESettingItemState.ENABLE,
      valueSetter: value => this.updateValue(value),
    };
    return settingItem;
  }
}
