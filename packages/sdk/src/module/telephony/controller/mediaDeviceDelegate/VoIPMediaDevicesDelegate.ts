/*
 * @Author: Paynter Chen
 * @Date: 2019-05-31 08:18:39
 * Copyright © RingCentral. All rights reserved.
 */

import { telephonyLogger } from 'foundation';
import _ from 'lodash';
import { IRTCMediaDeviceDelegate, RTCEngine, RTC_MEDIA_ACTION } from 'voip';
import { TelephonyGlobalConfig } from '../../config/TelephonyGlobalConfig';
import { TELEPHONY_GLOBAL_KEYS } from '../../config/configKeys';
import { DeviceSyncManger } from './DeviceSyncManger';
import { LastUsedDeviceManager } from './LastUsedDeviceManager';
import { SOURCE_TYPE, IStorage } from './types';
import { notificationCenter } from 'sdk/service';

const LOG_TAG = '[MediaDevicesDelegate]';
const DEFAULT_VOLUME = 0.5;

export class VoIPMediaDevicesDelegate implements IRTCMediaDeviceDelegate {
  private _microphoneSyncManager: DeviceSyncManger;
  private _speakerSyncManager: DeviceSyncManger;
  constructor(private _rtcEngine: RTCEngine = RTCEngine.getInstance()) {
    const speakerStorage: IStorage = {
      get: () => TelephonyGlobalConfig.getCurrentSpeaker(),
      set: (deviceId: string) =>
        TelephonyGlobalConfig.setCurrentSpeaker(deviceId),
      on: handleChanged => {
        const finalCallback = (type: number, value: string) =>
          handleChanged(value);
        TelephonyGlobalConfig.on(
          TELEPHONY_GLOBAL_KEYS.CURRENT_SPEAKER,
          finalCallback,
        );
        return () =>
          TelephonyGlobalConfig.off(
            TELEPHONY_GLOBAL_KEYS.CURRENT_SPEAKER,
            finalCallback,
          );
      },
    };
    const microphoneStorage: IStorage = {
      get: () => TelephonyGlobalConfig.getCurrentMicrophone(),
      set: (deviceId: string) =>
        TelephonyGlobalConfig.setCurrentMicrophone(deviceId),
      on: handleChanged => {
        const finalCallback = (type: number, value: string) =>
          handleChanged(value);
        TelephonyGlobalConfig.on(
          TELEPHONY_GLOBAL_KEYS.CURRENT_MICROPHONE,
          finalCallback,
        );
        return () =>
          TelephonyGlobalConfig.off(
            TELEPHONY_GLOBAL_KEYS.CURRENT_MICROPHONE,
            finalCallback,
          );
      },
    };
    this._microphoneSyncManager = new DeviceSyncManger(
      microphoneStorage,
      {
        getDevices: (): MediaDeviceInfo[] => this._rtcEngine.getAudioInputs(),
        setDeviceId: (id: string): void =>
          this._rtcEngine.setCurrentAudioInput(id),
        getDeviceId: (): string => this._rtcEngine.getCurrentAudioInput(),
        getDefaultDeviceId: (devices: MediaDeviceInfo[]): string =>
          this._rtcEngine.getDefaultDeviceId(devices),
        on: handleChanged => {
          notificationCenter.on(
            RTC_MEDIA_ACTION.INPUT_DEVICE_CHANGED,
            handleChanged,
          );
          return () =>
            notificationCenter.off(
              RTC_MEDIA_ACTION.INPUT_DEVICE_CHANGED,
              handleChanged,
            );
        },
      },
      new LastUsedDeviceManager({
        get: () => TelephonyGlobalConfig.getUsedMicrophoneHistory(),
        set: (value: string) =>
          TelephonyGlobalConfig.setUsedMicrophoneHistory(value),
      }),
    );
    this._speakerSyncManager = new DeviceSyncManger(
      speakerStorage,
      {
        getDevices: (): MediaDeviceInfo[] => this._rtcEngine.getAudioOutputs(),
        setDeviceId: (id: string): void =>
          this._rtcEngine.setCurrentAudioOutput(id),
        getDeviceId: (): string => this._rtcEngine.getCurrentAudioOutput(),
        getDefaultDeviceId: (devices: MediaDeviceInfo[]): string =>
          this._rtcEngine.getDefaultDeviceId(devices),
      },
      new LastUsedDeviceManager({
        get: () => TelephonyGlobalConfig.getUsedSpeakerHistory(),
        set: (value: string) =>
          TelephonyGlobalConfig.setUsedSpeakerHistory(value),
      }),
    );
    this._initDevicesState();
    this._subscribe();
  }

  private _initDevicesState() {
    telephonyLogger.tags(LOG_TAG).info('init');
    let volume = TelephonyGlobalConfig.getCurrentVolume();
    if (!volume) {
      volume = DEFAULT_VOLUME;
      TelephonyGlobalConfig.setCurrentVolume(String(DEFAULT_VOLUME));
    } else {
      volume = Number(volume);
    }
    this._rtcEngine.setVolume(volume);
    this._microphoneSyncManager.ensureDevice();
    this._speakerSyncManager.ensureDevice();
  }

  private _subscribe() {
    this._microphoneSyncManager.startSync();
    this._speakerSyncManager.startSync();
    TelephonyGlobalConfig.on(TELEPHONY_GLOBAL_KEYS.CURRENT_VOLUME, () =>
      this._rtcEngine.setVolume(
        Number(TelephonyGlobalConfig.getCurrentVolume()),
      ),
    );
    notificationCenter.on(
      RTC_MEDIA_ACTION.VOLUME_CHANGED,
      this._handleVolumeChanged,
    );
  }

  private _handleVolumeChanged = (volume: number) => {
    if (TelephonyGlobalConfig.getCurrentVolume() !== String(volume)) {
      TelephonyGlobalConfig.setCurrentVolume(String(volume));
    }
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
      this._microphoneSyncManager,
      audioInputs.devices,
      audioInputs.delta,
    );
    this._handlerDeviceChange(
      this._speakerSyncManager,
      audioOutputs.devices,
      audioOutputs.delta,
    );
  }
}
