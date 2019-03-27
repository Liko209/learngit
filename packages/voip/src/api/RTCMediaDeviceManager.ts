/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-02-27 14:15:09
 * Copyright © RingCentral. All rights reserved.
 */

import { rtcLogger } from '../utils/RTCLoggerProxy';
import { EventEmitter2 } from 'eventemitter2';
import { IRTCMediaDeviceDelegate } from './IRTCMediaDeviceDelegate';
import { RTC_MEDIA_ACTION } from './types';

const LOG_TAG = 'RTCMediaDeviceManager';
const defaultAudioID = 'default';
enum RTC_MEDIA_DEVICE_KIND {
  AUDIO_OUTPUT = 'audiooutput',
  AUDIO_INPUT = 'audioinput',
}

class RTCMediaDeviceManager extends EventEmitter2 {
  private static _singleton: RTCMediaDeviceManager | null = null;
  private _delegate: IRTCMediaDeviceDelegate;
  private _audioOutputs: MediaDeviceInfo[] = [];
  private _audioInputs: MediaDeviceInfo[] = [];
  private _selectedAudioOutputDeviceID: string;
  private _selectedAudioInputDeviceID: string;

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

  public setAudioOutputDevice(deviceInfo: MediaDeviceInfo) {
    if (deviceInfo.kind !== RTC_MEDIA_DEVICE_KIND.AUDIO_OUTPUT) {
      rtcLogger.debug(LOG_TAG, 'Output device is not audio output device');
      return;
    }
    if (
      !this._selectedAudioOutputDeviceID &&
      this._selectedAudioOutputDeviceID !== deviceInfo.deviceId
    ) {
      rtcLogger.debug(
        LOG_TAG,
        `Set output device name: ${deviceInfo.label}  ID: ${
          deviceInfo.deviceId
        }`,
      );
      this._selectedAudioOutputDeviceID = deviceInfo.deviceId;
      this.emit(
        RTC_MEDIA_ACTION.OUTPUT_DEVICE_CHANGED,
        this._selectedAudioOutputDeviceID,
      );
    }
  }

  public setAudioInputDevice(deviceInfo: MediaDeviceInfo) {
    if (deviceInfo.kind !== RTC_MEDIA_DEVICE_KIND.AUDIO_INPUT) {
      rtcLogger.debug(LOG_TAG, 'Input device is not audio input device');
      return;
    }
    if (
      !this._selectedAudioInputDeviceID &&
      this._selectedAudioInputDeviceID !== deviceInfo.deviceId
    ) {
      rtcLogger.debug(
        LOG_TAG,
        `Set input device name: ${deviceInfo.label}  ID: ${
          deviceInfo.deviceId
        }`,
      );
      this._selectedAudioInputDeviceID = deviceInfo.deviceId;
      this.emit(
        RTC_MEDIA_ACTION.INPUT_DEVICE_CHANGED,
        this._selectedAudioInputDeviceID,
      );
    }
  }

  public subscribeDeviceChange() {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.ondevicechange = () => {
        this.updateMediaDevices();
      };
    }
  }

  public updateMediaDevices() {
    rtcLogger.debug(LOG_TAG, 'Updating media device infos ...');
    if (!navigator.mediaDevices) {
      return;
    }
    navigator.mediaDevices
      .enumerateDevices()
      .then((deviceInfos: MediaDeviceInfo[]) => {
        this._gotMediaDevices(deviceInfos);
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

  private _gotMediaDevices(deviceInfos: MediaDeviceInfo[]) {
    this._audioOutputs = [];
    this._audioInputs = [];
    let defaultAudioInputName: string;
    let defaultAudioOutputName: string;
    deviceInfos.forEach((deviceInfo: MediaDeviceInfo) => {
      if (deviceInfo.kind === RTC_MEDIA_DEVICE_KIND.AUDIO_INPUT) {
        this._audioInputs.push(deviceInfo);
        if (defaultAudioID === deviceInfo.deviceId) {
          defaultAudioInputName = deviceInfo.label;
        } else if (defaultAudioInputName.includes(deviceInfo.label)) {
          this.setAudioInputDevice(deviceInfo);
        }
        rtcLogger.debug(
          LOG_TAG,
          `Audio input device FOUND: Name: ${deviceInfo.label} Id: ${
            deviceInfo.deviceId
          }`,
        );
      } else if (deviceInfo.kind === RTC_MEDIA_DEVICE_KIND.AUDIO_OUTPUT) {
        this._audioOutputs.push(deviceInfo);
        if (defaultAudioID === deviceInfo.deviceId) {
          defaultAudioOutputName = deviceInfo.label;
        } else if (defaultAudioOutputName.includes(deviceInfo.label)) {
          this.setAudioOutputDevice(deviceInfo);
        }
        rtcLogger.debug(
          LOG_TAG,
          `Audio output device FOUND: Name: ${deviceInfo.label} Id: ${
            deviceInfo.deviceId
          }`,
        );
      } else {
        rtcLogger.debug(
          LOG_TAG,
          `Audio output device FOUND: Name: ${deviceInfo.label} Id: ${
            deviceInfo.deviceId
          }, Kind: ${deviceInfo.kind}`,
        );
      }
    });
    if (this._delegate) {
      this._delegate.onMediaDevicesChanged(
        this._audioOutputs,
        this._audioInputs,
      );
    }
  }
}

export { RTCMediaDeviceManager };
