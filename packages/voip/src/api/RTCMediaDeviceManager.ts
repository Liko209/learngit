/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-02-27 14:15:09
 * Copyright © RingCentral. All rights reserved.
 */

import { rtcLogger } from '../utils/RTCLoggerProxy';
import { EventEmitter2 } from 'eventemitter2';
import { IRTCMediaDeviceDelegate } from './IRTCMediaDeviceDelegate';
import { RTC_MEDIA_ACTION } from './types';
import { defaultAudioID } from '../account/constants';
import _ from 'lodash';

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

  constructor() {
    super();
  }

  public static instance(): RTCMediaDeviceManager {
    if (!RTCMediaDeviceManager._singleton) {
      RTCMediaDeviceManager._singleton = new RTCMediaDeviceManager();
    }
    return RTCMediaDeviceManager._singleton;
  }

  public destroy() {
    if (RTCMediaDeviceManager._singleton) {
      rtcLogger.debug(LOG_TAG, 'Destroy media device manager');
      RTCMediaDeviceManager._singleton = null;
    }
  }

  public setMediaDeviceDelegate(delegate: IRTCMediaDeviceDelegate) {
    this._delegate = delegate;
  }

  public setAudioOutputDevice(deviceId: string) {
    rtcLogger.debug(LOG_TAG, `set audio output device id: ${deviceId}`);
    this._outputDeviceId = deviceId;
    if (this._audioOutputTimer) {
      clearTimeout(this._audioOutputTimer);
      this._audioOutputTimer = null;
    }
    this._audioOutputTimer = setTimeout(() => {
      this._emitAudioOutputChanged(deviceId);
    },                                  500);
  }

  public setAudioInputDevice(deviceId: string) {
    rtcLogger.debug(LOG_TAG, `set audio input device id: ${deviceId}`);
    this._inputDeviceId = deviceId;
    if (this._audioInputTimer) {
      clearTimeout(this._audioInputTimer);
      this._audioInputTimer = null;
    }
    this._audioInputTimer = setTimeout(() => {
      this._emitAudioInputChanged(deviceId);
    },                                 500);
  }

  public subscribeDeviceChange() {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.ondevicechange = () => {
        this._onMediaDevicesChange();
      };
    }
  }

  public initMediaDevices() {
    rtcLogger.debug(LOG_TAG, 'init updating media device infos ...');
    if (!navigator.mediaDevices) {
      return;
    }
    navigator.mediaDevices
      .enumerateDevices()
      .then((deviceInfos: MediaDeviceInfo[]) => {
        const { audioInputs, audioOutputs } = this._gotMediaDevices(
          deviceInfos,
        );
        this.setAudioInputDevice(this.getDefaultDeviceId(audioInputs));
        this.setAudioOutputDevice(this.getDefaultDeviceId(audioOutputs));
      })
      .catch((reason: any) => {
        rtcLogger.error(LOG_TAG, `Failed to get media device infos: ${reason}`);
      });
  }

  public getAudioOutputs(): MediaDeviceInfo[] {
    return this._audioOutputs;
  }

  public getAudioInputs(): MediaDeviceInfo[] {
    return this._audioInputs;
  }

  public getCurrentAudioInput(): string {
    return this._inputDeviceId;
  }

  public getCurrentAudioOutput(): string {
    return this._outputDeviceId;
  }

  private _emitAudioInputChanged(deviceId: string) {
    this.emit(RTC_MEDIA_ACTION.INPUT_DEVICE_CHANGED, deviceId);
  }

  private _emitAudioOutputChanged(deviceId: string) {
    this.emit(RTC_MEDIA_ACTION.OUTPUT_DEVICE_CHANGED, deviceId);
  }

  private _gotMediaDevices(deviceInfos: MediaDeviceInfo[]) {
    const audioInputs: MediaDeviceInfo[] = [];
    const audioOutputs: MediaDeviceInfo[] = [];
    let hasDefaultAudioInput = false;
    let hasDefaultAudioOutput = false;
    // get audio outputs and audio inputs
    deviceInfos.forEach((deviceInfo: MediaDeviceInfo) => {
      if (deviceInfo.kind === RTC_MEDIA_DEVICE_KIND.AUDIO_INPUT) {
        audioInputs.push(deviceInfo);
        if (defaultAudioID === deviceInfo.deviceId) {
          hasDefaultAudioInput = true;
        }
      } else if (deviceInfo.kind === RTC_MEDIA_DEVICE_KIND.AUDIO_OUTPUT) {
        audioOutputs.push(deviceInfo);
        if (defaultAudioID === deviceInfo.deviceId) {
          hasDefaultAudioOutput = true;
        }
      }
    });
    if (hasDefaultAudioInput && hasDefaultAudioOutput) {
      rtcLogger.debug(
        LOG_TAG,
        "Detect audio devices has 'default' as deviceId",
      );
      this._updateAudioDevices(RTC_MEDIA_DEVICE_KIND.AUDIO_INPUT, audioInputs);
      this._updateAudioDevices(
        RTC_MEDIA_DEVICE_KIND.AUDIO_OUTPUT,
        audioOutputs,
      );
    } else {
      rtcLogger.debug(
        LOG_TAG,
        "Audio devices has 'default' as deviceId NOT FOUND",
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
      (device: MediaDeviceInfo): boolean => {
        return (
          device.deviceId !== defaultAudioID && label.endsWith(device.label)
        );
      },
    );
    if (realDevice) {
      return realDevice.deviceId;
    }
    return defaultAudioID;
  }

  private _onMediaDevicesChange() {
    rtcLogger.debug(LOG_TAG, 'Updating media device infos ...');
    if (!navigator.mediaDevices) {
      return;
    }
    navigator.mediaDevices
      .enumerateDevices()
      .then((deviceInfos: MediaDeviceInfo[]) => {
        const oldAudioInputs = this._audioInputs;
        const oldAudioOutputs = this._audioOutputs;
        const { audioInputs, audioOutputs } = this._gotMediaDevices(
          deviceInfos,
        );
        if (this._delegate) {
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
        }
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
    return {
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
    rtcLogger.debug(LOG_TAG, `${kind} updated: ${JSON.stringify(newDevices)}`);
    if (kind === RTC_MEDIA_DEVICE_KIND.AUDIO_INPUT) {
      this._audioInputs = newDevices;
      this.emit(RTC_MEDIA_ACTION.INPUT_DEVICES_CHANGED, newDevices);
    } else {
      this._audioOutputs = newDevices;
      this.emit(RTC_MEDIA_ACTION.OUTPUT_DEVICES_CHANGED, newDevices);
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
      (acc, item) => {
        return acc + item.deviceId + item.label;
      },
      '',
    );
  }
}

export { RTCMediaDeviceManager };
