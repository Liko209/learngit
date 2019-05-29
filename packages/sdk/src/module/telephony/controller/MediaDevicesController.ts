import { telephonyLogger } from 'foundation';
import _ from 'lodash';
import { IRTCMediaDeviceDelegate, RTCEngine } from 'voip';
import { TelephonyUserConfig } from '../config/TelephonyUserConfig';
import { TELEPHONY_KEYS } from '../config/configKeys';

const LOG_TAG = '[MediaDevicesController]';
const MAX_DEVICE_HISTORY_SIZE = 5;

enum SOURCE_TYPE {
  EMPTY,
  STORAGE,
  LAST_USED,
  NEW_DEVICE,
  DEFAULT,
}

interface IStorage {
  get(): string;
  set(value: string): void;
}

interface IDeviceManager {
  getDevices(): MediaDeviceInfo[];
  setDeviceId(id: string): void;
  getDeviceId(): string;
  getDefaultDeviceId(): string;
}

interface ILastUsedDeviceManager {
  record(deviceId: string): void;
  getLastAvailableUsedDevice(devices: MediaDeviceInfo[]): string | undefined;
}

export class MediaDevicesController implements IRTCMediaDeviceDelegate {
  private _microphoneConfigManager: DeviceSyncManger;
  private _speakerConfigManager: DeviceSyncManger;
  constructor(
    private _userConfig: TelephonyUserConfig,
    private _rtcEngine: RTCEngine,
  ) {
    this._init();
  }

  private _init() {
    telephonyLogger.tags(LOG_TAG).info('init');
    const volume = this._userConfig.getCurrentVolume();
    volume && this._rtcEngine.setVolume(Number(volume));
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
    added: MediaDeviceInfo[],
    deleted: MediaDeviceInfo[],
  ) {
    telephonyLogger.tags(LOG_TAG).info('device change', { added, deleted });
    if (deleted.length) {
      manager.ensureDevice();
    }
    if (added.length) {
      manager.setDevice({
        source: SOURCE_TYPE.NEW_DEVICE,
        deviceId: _.last(added)!.deviceId,
      });
    }
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
      audioInputs.delta.added,
      audioInputs.delta.deleted,
    );
    this._handlerDeviceChange(
      this._speakerConfigManager,
      audioOutputs.delta.added,
      audioOutputs.delta.deleted,
    );
  }
}

class LastUsedDeviceManager implements ILastUsedDeviceManager {
  constructor(private _storage: IStorage) {}

  private _getHistories(): string[] {
    const historyString = this._storage.get();
    let histories: string[] = [];
    if (historyString) {
      try {
        histories = historyString.split(',');
      } catch {
        telephonyLogger.warn('parse storage value fail:', historyString);
      }
    }
    return histories;
  }

  record(deviceId: string): void {
    const histories = this._getHistories().filter(id => deviceId !== id);
    histories.push(deviceId);
    if (histories.length > MAX_DEVICE_HISTORY_SIZE) {
      histories.splice(0, MAX_DEVICE_HISTORY_SIZE - histories.length);
    }
    this._storage.set(histories.join(','));
  }

  getLastAvailableUsedDevice(devices: MediaDeviceInfo[]): string | undefined {
    const devicesSet = new Set(devices.map(device => device.deviceId));
    const lastUseDeviceId = _.findLast(
      this._getHistories(),
      (deviceId: string) => devicesSet.has(deviceId),
    );
    return lastUseDeviceId;
  }
}

class DeviceSyncManger {
  constructor(
    private _storage: IStorage,
    private _deviceManager: IDeviceManager,
    private _lastUsedDeviceManager: ILastUsedDeviceManager,
  ) {}

  private _ensureDevice = (): { source: SOURCE_TYPE; deviceId: string } => {
    const EMPTY_ID = 'EMPTY_ID';
    const devices = this._deviceManager.getDevices();
    if (!devices.length) {
      return {
        source: SOURCE_TYPE.EMPTY,
        deviceId: EMPTY_ID,
      };
    }
    const storageDeviceId = this._storage.get();
    if (devices.find(device => device.deviceId === storageDeviceId)) {
      return {
        source: SOURCE_TYPE.STORAGE,
        deviceId: storageDeviceId,
      };
    }
    const lastUsedDeviceId = this._lastUsedDeviceManager.getLastAvailableUsedDevice(
      devices,
    );
    if (lastUsedDeviceId) {
      return {
        source: SOURCE_TYPE.LAST_USED,
        deviceId: lastUsedDeviceId,
      };
    }
    const defaultDeviceId = this._deviceManager.getDefaultDeviceId();
    return {
      source: SOURCE_TYPE.DEFAULT,
      deviceId: defaultDeviceId,
    };
  }

  setDevice(info: { source: SOURCE_TYPE; deviceId: string }) {
    const { source, deviceId } = info;
    const device = this._deviceManager
      .getDevices()
      .find(device => device.deviceId === deviceId);
    if (deviceId !== this._deviceManager.getDeviceId()) {
      telephonyLogger
        .tags(LOG_TAG)
        .info('setDevice to deviceManager', { source, deviceId, device });
      this._deviceManager.setDeviceId(deviceId);
    }
    if (deviceId !== this._storage.get()) {
      telephonyLogger
        .tags(LOG_TAG)
        .info('setDevice to storage', { source, deviceId, device });
      this._lastUsedDeviceManager.record(deviceId);
      this._storage.set(deviceId);
    }
  }

  ensureDevice() {
    this.setDevice(this._ensureDevice());
  }
}
