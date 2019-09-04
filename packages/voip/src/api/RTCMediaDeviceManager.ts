/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-02-27 14:15:09
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import _ from 'lodash';
import { rtcLogger } from '../utils/RTCLoggerProxy';
import { IRTCMediaDeviceDelegate } from './IRTCMediaDeviceDelegate';
import { RTC_MEDIA_ACTION } from './types';
import { defaultAudioID } from '../account/constants';

const LOG_TAG = 'RTCMediaDeviceManager';
enum RTC_MEDIA_DEVICE_KIND {
  AUDIO_OUTPUT = 'audiooutput',
  AUDIO_INPUT = 'audioinput',
}

class RTCMediaDeviceManager extends EventEmitter2 {
  private static _singleton: RTCMediaDeviceManager | null = null;
  private _delegate: IRTCMediaDeviceDelegate;
  private _audioOutputs: MediaDeviceInfo[] = [];
  private _audioInputs: MediaDeviceInfo[] = [];
  private _audioInputTimer: NodeJS.Timeout | null = null;
  private _audioOutputTimer: NodeJS.Timeout | null = null;
  private _inputDeviceId: string = '';
  private _outputDeviceId: string = '';

  static instance(): RTCMediaDeviceManager {
    if (!RTCMediaDeviceManager._singleton) {
      RTCMediaDeviceManager._singleton = new RTCMediaDeviceManager();
    }
    return RTCMediaDeviceManager._singleton;
  }

  destroy() {
    if (RTCMediaDeviceManager._singleton) {
      rtcLogger.debug(LOG_TAG, 'Destroy media device manager');
      RTCMediaDeviceManager._singleton = null;
    }
  }

  setMediaDeviceDelegate(delegate: IRTCMediaDeviceDelegate) {
    this._delegate = delegate;
  }

  setAudioOutputDevice(deviceId: string) {
    rtcLogger.debug(LOG_TAG, `set audio output device id: ${deviceId}`);
    this._outputDeviceId = deviceId;
    if (this._audioOutputTimer) {
      clearTimeout(this._audioOutputTimer);
      this._audioOutputTimer = null;
    }
    this._audioOutputTimer = setTimeout(() => {
      this._emitAudioOutputChanged(deviceId);
    }, 500);
  }

  setAudioInputDevice(deviceId: string) {
    rtcLogger.debug(LOG_TAG, `set audio input device id: ${deviceId}`);
    this._inputDeviceId = deviceId;
    if (this._audioInputTimer) {
      clearTimeout(this._audioInputTimer);
      this._audioInputTimer = null;
    }
    this._audioInputTimer = setTimeout(() => {
      this._emitAudioInputChanged(deviceId);
    }, 500);
  }

  subscribeDeviceChange() {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.ondevicechange = () => {
        this._onMediaDevicesChange();
      };
    }
  }

  async initMediaDevices() {
    rtcLogger.debug(LOG_TAG, 'init updating media device infos ...');
    if (!navigator.mediaDevices) {
      return;
    }
    return navigator.mediaDevices
      .enumerateDevices()
      .then((deviceInfos: MediaDeviceInfo[]) => {
        const { audioInputs, audioOutputs } = this._gotMediaDevices(
          deviceInfos,
        );
        this._delegate &&
          this._delegate.onMediaDevicesInitialed(audioOutputs, audioInputs);
      })
      .catch((reason: any) => {
        rtcLogger.error(LOG_TAG, `Failed to get media device infos: ${reason}`);
      });
  }

  getAudioOutputs(): MediaDeviceInfo[] {
    return this._audioOutputs;
  }

  getAudioInputs(): MediaDeviceInfo[] {
    return this._audioInputs;
  }

  getCurrentAudioInput(): string {
    return this._inputDeviceId;
  }

  getCurrentAudioOutput(): string {
    return this._outputDeviceId;
  }

  private _emitAudioInputChanged(deviceId: string) {
    this.emit(RTC_MEDIA_ACTION.INPUT_DEVICE_CHANGED, deviceId);
  }

  private _emitAudioOutputChanged(deviceId: string) {
    this.emit(RTC_MEDIA_ACTION.OUTPUT_DEVICE_CHANGED, deviceId);
  }

  private _gotMediaDevices(deviceInfos: MediaDeviceInfo[]) {
    const originalAudioInputs: MediaDeviceInfo[] = [];
    const originalAudioOutputs: MediaDeviceInfo[] = [];
    let audioInputs: MediaDeviceInfo[] = [];
    let audioOutputs: MediaDeviceInfo[] = [];
    let hasDefaultAudioInput = false;
    let hasDefaultAudioOutput = false;
    // get audio outputs and audio inputs
    deviceInfos.forEach((deviceInfo: MediaDeviceInfo) => {
      if (deviceInfo.kind === RTC_MEDIA_DEVICE_KIND.AUDIO_INPUT) {
        originalAudioInputs.push(deviceInfo);
        if (defaultAudioID === deviceInfo.deviceId) {
          hasDefaultAudioInput = true;
        }
      } else if (deviceInfo.kind === RTC_MEDIA_DEVICE_KIND.AUDIO_OUTPUT) {
        originalAudioOutputs.push(deviceInfo);
        if (defaultAudioID === deviceInfo.deviceId) {
          hasDefaultAudioOutput = true;
        }
      }
    });

    if (hasDefaultAudioInput) {
      rtcLogger.debug(
        LOG_TAG,
        "Detect audio input devices has 'default' as deviceId",
      );
      audioInputs = originalAudioInputs;
      this._updateAudioDevices(RTC_MEDIA_DEVICE_KIND.AUDIO_INPUT, audioInputs);
    } else {
      rtcLogger.debug(
        LOG_TAG,
        "Audio input devices has 'default' as deviceId NOT FOUND",
      );
    }
    if (hasDefaultAudioOutput) {
      rtcLogger.debug(
        LOG_TAG,
        "Detect audio output devices has 'default' as deviceId",
      );
      audioOutputs = originalAudioOutputs;
      this._updateAudioDevices(
        RTC_MEDIA_DEVICE_KIND.AUDIO_OUTPUT,
        audioOutputs,
      );
    } else {
      rtcLogger.debug(
        LOG_TAG,
        "Audio output devices has 'default' as deviceId NOT FOUND",
      );
    }
    return {
      audioInputs,
      audioOutputs,
    };
  }

  getDefaultDeviceId(devices: MediaDeviceInfo[]): string {
    if (!devices || devices.length === 0) {
      return defaultAudioID;
    }
    let label: string = '';
    devices.forEach((device: MediaDeviceInfo) => {
      if (device.deviceId && device.deviceId === defaultAudioID) {
        label = device.label;
      }
    });
    if (label === '') {
      return defaultAudioID;
    }
    rtcLogger.debug(LOG_TAG, `default device label: ${label}`);
    const realDevice = devices.find(
      (device: MediaDeviceInfo): boolean =>
        device.deviceId !== defaultAudioID && label.endsWith(device.label),
    );
    if (realDevice) {
      return realDevice.deviceId;
    }
    return defaultAudioID;
  }

  private async _onMediaDevicesChange() {
    rtcLogger.debug(LOG_TAG, 'Updating media device infos ...');
    if (!navigator.mediaDevices) {
      return;
    }
    return navigator.mediaDevices
      .enumerateDevices()
      .then((deviceInfos: MediaDeviceInfo[]) => {
        const oldAudioInputs = this._audioInputs;
        const oldAudioOutputs = this._audioOutputs;
        const { audioInputs, audioOutputs } = this._gotMediaDevices(
          deviceInfos,
        );
        this._delegate &&
          (audioInputs.length !== 0 || audioOutputs.length !== 0) &&
          this._delegate.onMediaDevicesChanged(
            {
              devices: audioOutputs,
              delta: this._getDevicesDelta(audioOutputs, oldAudioOutputs),
            },
            {
              devices: audioInputs,
              delta: this._getDevicesDelta(audioInputs, oldAudioInputs),
            },
          );
      })
      .catch((reason: any) => {
        rtcLogger.error(LOG_TAG, `Failed to get media device infos: ${reason}`);
      });
  }

  private _getDevicesDelta(
    newDevices: MediaDeviceInfo[],
    oldDevices: MediaDeviceInfo[],
  ) {
    const compareFunc = (l: MediaDeviceInfo, r: MediaDeviceInfo) =>
      l.deviceId === r.deviceId;
    const deleted = _.differenceWith(oldDevices, newDevices, compareFunc);
    const added = _.differenceWith(newDevices, oldDevices, compareFunc);
    const hashChanged = this._checkIfDeviceChanged(oldDevices, newDevices);
    return {
      hashChanged,
      added,
      deleted,
    };
  }

  private _updateAudioDevices(
    kind: RTC_MEDIA_DEVICE_KIND,
    newDevices: MediaDeviceInfo[],
  ) {
    if (
      !this._checkIfDeviceChanged(
        kind === RTC_MEDIA_DEVICE_KIND.AUDIO_INPUT
          ? this._audioInputs
          : this._audioOutputs,
        newDevices,
      )
    ) {
      return;
    }
    if (!this._delegate) {
      kind === RTC_MEDIA_DEVICE_KIND.AUDIO_INPUT
        ? this.setAudioInputDevice(this.getDefaultDeviceId(newDevices))
        : this.setAudioOutputDevice(this.getDefaultDeviceId(newDevices));
    }
    rtcLogger.debug(LOG_TAG, `${kind} updated: ${JSON.stringify(newDevices)}`);
    if (kind === RTC_MEDIA_DEVICE_KIND.AUDIO_INPUT) {
      this._audioInputs = newDevices;
      this.emit(RTC_MEDIA_ACTION.INPUT_DEVICE_LIST_CHANGED, newDevices);
    } else {
      this._audioOutputs = newDevices;
      this.emit(RTC_MEDIA_ACTION.OUTPUT_DEVICE_LIST_CHANGED, newDevices);
    }
  }

  private _checkIfDeviceChanged(
    oldDevices: MediaDeviceInfo[],
    newDevices: MediaDeviceInfo[],
  ): boolean {
    if (oldDevices.length !== newDevices.length) {
      return true;
    }
    const oldHash = this._generateDevicesHash(oldDevices);
    const newHash = this._generateDevicesHash(newDevices);
    return oldHash !== newHash;
  }

  private _generateDevicesHash(devices: MediaDeviceInfo[]): string {
    if (devices.length === 0) {
      return '';
    }
    return _.reduce(
      devices,
      (acc, item) => acc + item.deviceId + item.label,
      '',
    );
  }
}

export { RTCMediaDeviceManager };
