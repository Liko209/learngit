/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-05 10:41:15
 * Copyright © RingCentral. All rights reserved.
 */
import {
  ITelephonyNetworkDelegate,
  ITelephonyDaoDelegate,
} from 'foundation/telephony';
import { RTCUserInfo } from './types';
import { RTCAccount } from './RTCAccount';
import { IRTCAccountDelegate } from './IRTCAccountDelegate';
import { IRTCLogger } from '../utils/IRTCLogger';
import { rtcLogger } from '../utils/RTCLoggerProxy';
import { RTCRestApiManager } from '../utils/RTCRestApiManager';
import { RTCDaoManager } from '../utils/RTCDaoManager';
import { RTCMediaDeviceManager } from './RTCMediaDeviceManager';
import { RTCMediaElementManager } from '../utils/RTCMediaElementManager';
import { IRTCMediaDeviceDelegate } from './IRTCMediaDeviceDelegate';

class RTCEngine {
  private static _instance: RTCEngine | null;
  private _userInfo: RTCUserInfo;

  static getInstance() {
    if (!RTCEngine._instance) {
      RTCEngine._instance = new RTCEngine();
    }
    return RTCEngine._instance;
  }

  protected constructor() {
    RTCMediaDeviceManager.instance().initMediaDevices();
    RTCMediaDeviceManager.instance().subscribeDeviceChange();
  }

  destroy() {
    RTCMediaDeviceManager.instance().destroy();
    RTCEngine._instance = null;
  }

  setUserInfo(info: RTCUserInfo) {
    if (info) {
      this._userInfo = info;
    }
  }

  createAccount(delegate: IRTCAccountDelegate): RTCAccount {
    return new RTCAccount(delegate, this._userInfo);
  }

  static setLogger(logger: IRTCLogger): void {
    rtcLogger.setLogger(logger);
  }

  setNetworkDelegate(delegate: ITelephonyNetworkDelegate): void {
    RTCRestApiManager.instance().setNetworkDelegate(delegate);
  }

  setTelephonyDaoDelegate(delegate: ITelephonyDaoDelegate): void {
    RTCDaoManager.instance().setDaoDelegate(delegate);
  }

  setVolume(volume: number): void {
    RTCMediaElementManager.instance().setVolume(volume);
  }

  getVolume(): number {
    return RTCMediaElementManager.instance().getVolume();
  }

  setMediaDeviceDelegate(delegate: IRTCMediaDeviceDelegate): void {
    RTCMediaDeviceManager.instance().setMediaDeviceDelegate(delegate);
  }

  getAudioInputs(): MediaDeviceInfo[] {
    return RTCMediaDeviceManager.instance().getAudioInputs();
  }

  getAudioOutputs(): MediaDeviceInfo[] {
    return RTCMediaDeviceManager.instance().getAudioOutputs();
  }

  getCurrentAudioInput() {
    return RTCMediaDeviceManager.instance().getCurrentAudioInput();
  }

  setCurrentAudioInput(deviceId: string) {
    return RTCMediaDeviceManager.instance().setAudioInputDevice(deviceId);
  }

  getCurrentAudioOutput() {
    return RTCMediaDeviceManager.instance().getCurrentAudioOutput();
  }

  setCurrentAudioOutput(deviceId: string) {
    return RTCMediaDeviceManager.instance().setAudioOutputDevice(deviceId);
  }

  getDefaultDeviceId(devices: MediaDeviceInfo[]) {
    return RTCMediaDeviceManager.instance().getDefaultDeviceId(devices);
  }
}

export { RTCEngine };
