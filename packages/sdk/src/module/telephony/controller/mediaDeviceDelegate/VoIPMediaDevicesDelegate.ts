/*
 * @Author: Paynter Chen
 * @Date: 2019-05-31 08:18:39
 * Copyright © RingCentral. All rights reserved.
 */

import { telephonyLogger } from 'foundation';
import _ from 'lodash';
import { IRTCMediaDeviceDelegate, RTCEngine } from 'voip';
import { TelephonyUserConfig } from '../../config/TelephonyUserConfig';
import { TELEPHONY_KEYS } from '../../config/configKeys';
import { DeviceSyncManger } from './DeviceSyncManger';
import { LastUsedDeviceManager } from './LastUsedDeviceManager';
import { SOURCE_TYPE, IStorage } from './types';

const LOG_TAG = '[MediaDevicesDelegate]';
const DEFAULT_VOLUME = 50;

export class VoIPMediaDevicesDelegate implements IRTCMediaDeviceDelegate {
  private _microphoneConfigManager: DeviceSyncManger;
  private _speakerConfigManager: DeviceSyncManger;
  constructor(
    private _userConfig: TelephonyUserConfig,
    private _rtcEngine: RTCEngine = RTCEngine.getInstance(),
  ) {
    const speakerStorage: IStorage = {
      get: () => this._userConfig.getCurrentSpeaker(),
      set: (deviceId: string) => this._userConfig.setCurrentSpeaker(deviceId),
    };
    const microphoneStorage: IStorage = {
      get: () => this._userConfig.getCurrentMicrophone(),
      set: (deviceId: string) =>
        this._userConfig.setCurrentMicrophone(deviceId),
    };
    this._microphoneConfigManager = new DeviceSyncManger(
      microphoneStorage,
      {
        getDevices: (): MediaDeviceInfo[] => this._rtcEngine.getAudioInputs(),
        setDeviceId: (id: string): void =>
          this._rtcEngine.setCurrentAudioInput(id),
        getDeviceId: (): string => this._rtcEngine.getCurrentAudioInput(),
        getDefaultDeviceId: (): string =>
          this._rtcEngine.getCurrentAudioInput(), // todo
      },
      new LastUsedDeviceManager({
        get: () => this._userConfig.getUsedMicrophoneHistory(),
        set: (value: string) =>
          this._userConfig.setUsedMicrophoneHistory(value),
      }),
    );
    this._speakerConfigManager = new DeviceSyncManger(
      speakerStorage,
      {
        getDevices: (): MediaDeviceInfo[] => this._rtcEngine.getAudioOutputs(),
        setDeviceId: (id: string): void =>
          this._rtcEngine.setCurrentAudioOutput(id),
        getDeviceId: (): string => this._rtcEngine.getCurrentAudioOutput(),
        getDefaultDeviceId: (): string =>
          this._rtcEngine.getCurrentAudioOutput(), // todo
      },
      new LastUsedDeviceManager({
        get: () => this._userConfig.getUsedSpeakerHistory(),
        set: (value: string) => this._userConfig.setUsedSpeakerHistory(value),
      }),
    );
    this._initDevicesState();
    this._subscribe();
  }

  private _initDevicesState() {
    telephonyLogger.tags(LOG_TAG).info('init');
    let volume = Number(this._userConfig.getCurrentVolume());
    if (Number.isNaN(volume)) {
      volume = DEFAULT_VOLUME;
    }
    this._rtcEngine.setVolume(volume);
    this._microphoneConfigManager.ensureDevice();
    this._speakerConfigManager.ensureDevice();
  }

  private _subscribe() {
    this._userConfig.on(TELEPHONY_KEYS.CURRENT_MICROPHONE, () =>
      this._microphoneConfigManager.ensureDevice(),
    );
    this._userConfig.on(TELEPHONY_KEYS.CURRENT_SPEAKER, () =>
      this._speakerConfigManager.ensureDevice(),
    );
    this._userConfig.on(TELEPHONY_KEYS.CURRENT_VOLUME, () =>
      this._rtcEngine.setVolume(Number(this._userConfig.getCurrentVolume())),
    );
  }

  private _handlerDeviceChange(
    manager: DeviceSyncManger,
    devices: MediaDeviceInfo[],
    delta: {
      added: MediaDeviceInfo[];
      deleted: MediaDeviceInfo[];
    },
  ) {
    telephonyLogger.tags(LOG_TAG).info('device change', delta);

    if (delta.deleted.length) {
      manager.ensureDevice();
    }
    if (delta.added.length) {
      manager.setDevice({
        source: SOURCE_TYPE.NEW_DEVICE,
        deviceId: _.last(delta.added)!.deviceId,
      });
    }
  }

  onMediaDevicesInitialed(
    audioOutputs: MediaDeviceInfo[],
    audioInputs: MediaDeviceInfo[],
  ): void {
    // if RTCEngine is init after Delegate, should init again
    this._initDevicesState();
  }

  onMediaDevicesChanged(
    audioOutputs: {
      devices: MediaDeviceInfo[];
      delta: { added: MediaDeviceInfo[]; deleted: MediaDeviceInfo[] };
    },
    audioInputs: {
      devices: MediaDeviceInfo[];
      delta: { added: MediaDeviceInfo[]; deleted: MediaDeviceInfo[] };
    },
  ): void {
    this._handlerDeviceChange(
      this._microphoneConfigManager,
      audioInputs.devices,
      audioInputs.delta,
    );
    this._handlerDeviceChange(
      this._speakerConfigManager,
      audioOutputs.devices,
      audioOutputs.delta,
    );
  }
}
