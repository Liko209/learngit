/*
 * @Author: Paynter Chen
 * @Date: 2019-05-31 08:18:39
 * Copyright © RingCentral. All rights reserved.
 */

import { telephonyLogger } from 'foundation/log';
import _ from 'lodash';
import { IRTCMediaDeviceDelegate, RTCEngine, RTC_MEDIA_ACTION } from 'voip';
import { TelephonyGlobalConfig } from '../../config/TelephonyGlobalConfig';
import { TELEPHONY_GLOBAL_KEYS } from '../../config/configKeys';
import { DeviceSyncManger } from './DeviceSyncManger';
import { LastUsedDeviceManager } from './LastUsedDeviceManager';
import { SOURCE_TYPE, IStorage } from './types';
import { notificationCenter } from 'sdk/service';
import { RINGER_ADDITIONAL_TYPE } from '../../types';

const LOG_TAG = '[MediaDevicesDelegate]';
const DEFAULT_VOLUME = 0.5;
const BLUE_TOOTH_MODE = {
  HANDS_FREE: 'Hands-Free',
  STEREO: 'Stereo',
};
let ringerStorage: IStorage;
export class VoIPMediaDevicesDelegate implements IRTCMediaDeviceDelegate {
  private _microphoneSyncManager: DeviceSyncManger;
  private _speakerSyncManager: DeviceSyncManger;
  private _ringerSyncManager: DeviceSyncManger;
  private _currentRingerId: string;
  constructor(private _rtcEngine: RTCEngine = RTCEngine.getInstance()) {
    this._init();
  }

  private _init() {
    this._microphoneSyncManager = new DeviceSyncManger(
      this._buildDeviceStorage(TELEPHONY_GLOBAL_KEYS.CURRENT_MICROPHONE),
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
      this._buildLastUsedDeviceManager(
        TELEPHONY_GLOBAL_KEYS.USED_MICROPHONE_HISTORY,
      ),
    );
    this._speakerSyncManager = new DeviceSyncManger(
      this._buildDeviceStorage(TELEPHONY_GLOBAL_KEYS.CURRENT_SPEAKER),
      {
        getDevices: (): MediaDeviceInfo[] => this._rtcEngine.getAudioOutputs(),
        setDeviceId: (id: string): void =>
          this._rtcEngine.setCurrentAudioOutput(id),
        getDeviceId: (): string => this._rtcEngine.getCurrentAudioOutput(),
        getDefaultDeviceId: (devices: MediaDeviceInfo[]): string =>
          this._rtcEngine.getDefaultDeviceId(devices),
      },
      this._buildLastUsedDeviceManager(
        TELEPHONY_GLOBAL_KEYS.USED_SPEAKER_HISTORY,
      ),
    );
    this._ringerSyncManager = new DeviceSyncManger(
      (ringerStorage = this._buildDeviceStorage(
        TELEPHONY_GLOBAL_KEYS.CURRENT_RINGER,
      )),
      {
        getDevices: (): MediaDeviceInfo[] => this.getRingerDevicesList(),
        setDeviceId: (id: string): void => {
          this._currentRingerId = id;
        },
        getDeviceId: (): string => this._currentRingerId,
        getDefaultDeviceId: (devices: MediaDeviceInfo[]): string =>
          this._rtcEngine.getDefaultDeviceId(devices),
      },
      this._buildLastUsedDeviceManager(
        TELEPHONY_GLOBAL_KEYS.USED_RINGER_HISTORY,
      ),
    );
    this._initDevicesState();
    this._subscribe();
  }

  private _buildDeviceStorage(key: string) {
    const storage: IStorage = {
      get: () => TelephonyGlobalConfig.get(key),
      set: (value: string) => {
        TelephonyGlobalConfig.put(key, value);
      },
      on: (handleChanged: Function) => {
        const finalCallback = (type: number, value: string) =>
          handleChanged(value);
        TelephonyGlobalConfig.on(key, finalCallback);
        return () => TelephonyGlobalConfig.off(key, finalCallback);
      },
    };
    return storage;
  }

  private _buildLastUsedDeviceManager(key: string) {
    return new LastUsedDeviceManager({
      get: () => TelephonyGlobalConfig.get(key),
      set: (value: string) => {
        TelephonyGlobalConfig.put(key, value);
      },
    });
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
    this._ringerSyncManager.ensureDevice();
  }

  private _subscribe() {
    this._microphoneSyncManager.startSync();
    this._speakerSyncManager.startSync();
    this._ringerSyncManager.startSync();
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
  };

  private _handlerDeviceChange(
    manager: DeviceSyncManger,
    devices: MediaDeviceInfo[],
    delta: {
      hashChanged: boolean;
      added: MediaDeviceInfo[];
      deleted: MediaDeviceInfo[];
    },
  ) {
    if (delta.deleted.length || delta.hashChanged) {
      manager.ensureDevice();
    }
    if (delta.added.length) {
      const useableDevices = delta.added.filter(device => {
        if (!device.label) return true;
        const { bluetoothMode } = this._extractBluetoothInfo(device.label) || {
          bluetoothMode: null,
        };
        if (!bluetoothMode) {
          return true;
        }
        if (bluetoothMode === BLUE_TOOTH_MODE.HANDS_FREE) {
          return true;
        }
        return false;
      });
      useableDevices.length &&
        manager.setDevice({
          source: SOURCE_TYPE.NEW_DEVICE,
          deviceId: _.last(useableDevices)!.deviceId,
        });
    }
  }

  onMediaDevicesInitialed(
    audioOutputs: MediaDeviceInfo[],
    audioInputs: MediaDeviceInfo[],
  ): void {
    // if RTCEngine is init after Delegate, should init again
    this._initDevicesState();

    notificationCenter.emit(
      RTC_MEDIA_ACTION.INPUT_DEVICE_LIST_CHANGED,
      audioInputs,
    );
    notificationCenter.emit(
      RTC_MEDIA_ACTION.OUTPUT_DEVICE_LIST_CHANGED,
      audioOutputs,
    );
  }

  onMediaDevicesChanged(
    audioOutputs: {
      devices: MediaDeviceInfo[];
      delta: {
        hashChanged: boolean;
        added: MediaDeviceInfo[];
        deleted: MediaDeviceInfo[];
      };
    },
    audioInputs: {
      devices: MediaDeviceInfo[];
      delta: {
        hashChanged: boolean;
        added: MediaDeviceInfo[];
        deleted: MediaDeviceInfo[];
      };
    },
  ): void {
    telephonyLogger
      .tags(LOG_TAG)
      .info('device change', audioInputs.delta, audioOutputs.delta);
    if (
      audioInputs.delta.added.length ||
      audioInputs.delta.deleted.length ||
      audioInputs.delta.hashChanged
    ) {
      this._handlerDeviceChange(
        this._microphoneSyncManager,
        audioInputs.devices,
        audioInputs.delta,
      );
      notificationCenter.emit(
        RTC_MEDIA_ACTION.INPUT_DEVICE_LIST_CHANGED,
        audioInputs.devices,
      );
    }
    if (
      audioOutputs.delta.added.length ||
      audioOutputs.delta.deleted.length ||
      audioOutputs.delta.hashChanged
    ) {
      this._handlerDeviceChange(
        this._speakerSyncManager,
        audioOutputs.devices,
        audioOutputs.delta,
      );
      this._handlerDeviceChangeForRinger(
        this._ringerSyncManager,
        audioOutputs.devices,
        audioOutputs.delta,
      );
      notificationCenter.emit(
        RTC_MEDIA_ACTION.OUTPUT_DEVICE_LIST_CHANGED,
        audioOutputs.devices,
      );
    }
  }

  // @ts-ignore
  onMediaPermissionChanged(newState: PermissionState): void {
    notificationCenter.emit(
      RTC_MEDIA_ACTION.INPUT_DEVICE_LIST_CHANGED,
      this._rtcEngine.getAudioInputs(),
    );
    notificationCenter.emit(
      RTC_MEDIA_ACTION.OUTPUT_DEVICE_LIST_CHANGED,
      this._rtcEngine.getAudioOutputs(),
    );
    telephonyLogger.tags(LOG_TAG).info('detect microphone permission changed.');
    if (newState !== 'granted') return;
    telephonyLogger.tags(LOG_TAG).info('process microphone.');
    this._switchStereoToHandsFreeIfNeed(
      this._rtcEngine.getAudioInputs(),
      this._rtcEngine.getCurrentAudioInput(),
      id =>
        this._microphoneSyncManager.setDevice({
          deviceId: id,
          source: SOURCE_TYPE.DEVICE_COMPATIBILITY,
        }),
    );
    telephonyLogger.tags(LOG_TAG).info('process speaker.');
    this._switchStereoToHandsFreeIfNeed(
      this._rtcEngine.getAudioOutputs(),
      this._rtcEngine.getCurrentAudioOutput(),
      id =>
        this._speakerSyncManager.setDevice({
          deviceId: id,
          source: SOURCE_TYPE.DEVICE_COMPATIBILITY,
        }),
    );
    telephonyLogger.tags(LOG_TAG).info('process ringer.');
    this._switchStereoToHandsFreeIfNeed(
      this.getRingerDevicesList(),
      this._currentRingerId,
      id =>
        this._ringerSyncManager.setDevice({
          deviceId: id,
          source: SOURCE_TYPE.DEVICE_COMPATIBILITY,
        }),
    );
  }

  private _handlerDeviceChangeForRinger(
    manager: DeviceSyncManger,
    devices: MediaDeviceInfo[],
    delta: {
      hashChanged: boolean;
      added: MediaDeviceInfo[];
      deleted: MediaDeviceInfo[];
    },
  ) {
    if (
      !([
        RINGER_ADDITIONAL_TYPE.ALL,
        RINGER_ADDITIONAL_TYPE.OFF,
      ] as string[]).includes(ringerStorage.get())
    ) {
      this._handlerDeviceChange(manager, devices, delta);
    }
  }

  getRingerDevicesList() {
    const outputs = this._rtcEngine.getAudioOutputs();
    if (outputs.length) {
      return [
        ...outputs,
        {
          deviceId: RINGER_ADDITIONAL_TYPE.ALL,
          label: RINGER_ADDITIONAL_TYPE.ALL,
        } as MediaDeviceInfo,
        {
          deviceId: RINGER_ADDITIONAL_TYPE.OFF,
          label: RINGER_ADDITIONAL_TYPE.OFF,
        } as MediaDeviceInfo,
      ];
    }
    return outputs;
  }

  private _switchStereoToHandsFreeIfNeed(
    devices: MediaDeviceInfo[],
    currentDeviceId: string,
    setDeviceId: (deviceId: string) => void,
  ) {
    const currentDevice = _.find(
      devices,
      device => device.deviceId === currentDeviceId,
    );
    if (currentDevice) {
      const bluetoothInfo = this._extractBluetoothInfo(currentDevice.label);
      if (
        bluetoothInfo &&
        bluetoothInfo.bluetoothMode === BLUE_TOOTH_MODE.STEREO
      ) {
        telephonyLogger.tags(LOG_TAG).info('detect bluetooth in stereo mode.');
        const handsFreeDevice = _.find(devices, device => {
          const info = this._extractBluetoothInfo(device.label);
          return !!(
            info &&
            info.bluetoothMode === BLUE_TOOTH_MODE.HANDS_FREE &&
            info.deviceName === bluetoothInfo.deviceName
          );
        });
        if (handsFreeDevice) {
          setDeviceId(handsFreeDevice.deviceId);
          telephonyLogger
            .tags(LOG_TAG)
            .info(
              'switch bluetooth device: ',
              currentDevice,
              ' to:',
              handsFreeDevice,
            );
        }
      }
    }
  }

  private _extractBluetoothInfo(label: string) {
    const match = /\((.*) (Hands-Free|Stereo)\) \(Bluetooth\)$/.exec(label);
    if (match) {
      return {
        deviceName: match[1],
        bluetoothMode: match[2],
      };
    }
    return null;
  }
}
