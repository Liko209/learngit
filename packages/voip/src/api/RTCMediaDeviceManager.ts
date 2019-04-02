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
  private _hasDefaultInputAudioDeviceId: boolean = false;
  private _hasDefaultOutputAudioDeviceId: boolean = false;

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
    this.emit(RTC_MEDIA_ACTION.OUTPUT_DEVICE_CHANGED, deviceId);
  }

  public setAudioInputDevice(deviceId: string) {
    this.emit(RTC_MEDIA_ACTION.INPUT_DEVICE_CHANGED, deviceId);
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
    this._hasDefaultOutputAudioDeviceId = false;
    this._hasDefaultInputAudioDeviceId = false;
    deviceInfos.forEach((deviceInfo: MediaDeviceInfo) => {
      if (deviceInfo.kind === RTC_MEDIA_DEVICE_KIND.AUDIO_INPUT) {
        this._audioInputs.push(deviceInfo);
        if (defaultAudioID === deviceInfo.deviceId) {
          this._hasDefaultInputAudioDeviceId = true;
          this.setAudioInputDevice(deviceInfo.deviceId);
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
          this._hasDefaultOutputAudioDeviceId = true;
          this.setAudioOutputDevice(deviceInfo.deviceId);
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

  hasDefaultInputAudioDeviceId(): boolean {
    return this._hasDefaultInputAudioDeviceId;
  }

  hasDefaultOutputAudioDeviceId(): boolean {
    return this._hasDefaultOutputAudioDeviceId;
  }
}

export { RTCMediaDeviceManager };
