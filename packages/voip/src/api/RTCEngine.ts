/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-05 10:41:15
 * Copyright © RingCentral. All rights reserved.
 */
import { ITelephonyNetworkDelegate, ITelephonyDaoDelegate } from 'foundation';
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

  public static getInstance() {
    if (!RTCEngine._instance) {
      RTCEngine._instance = new RTCEngine();
    }
    return RTCEngine._instance;
  }

  protected constructor() {
    RTCMediaDeviceManager.instance().initMediaDevices();
    RTCMediaDeviceManager.instance().subscribeDeviceChange();
  }

  public destroy() {
    RTCMediaDeviceManager.instance().destroy();
    RTCEngine._instance = null;
  }

  public setUserInfo(info: RTCUserInfo) {
    if (info) {
      this._userInfo = info;
    }
  }

  public createAccount(delegate: IRTCAccountDelegate): RTCAccount {
    return new RTCAccount(delegate, this._userInfo);
  }

  public static setLogger(logger: IRTCLogger): void {
    rtcLogger.setLogger(logger);
  }

  public setNetworkDelegate(delegate: ITelephonyNetworkDelegate): void {
    RTCRestApiManager.instance().setNetworkDelegate(delegate);
  }

  public setTelephonyDaoDelegate(delegate: ITelephonyDaoDelegate): void {
    RTCDaoManager.instance().setDaoDelegate(delegate);
  }

  public setVolume(volume: number): void {
    RTCMediaElementManager.instance().setVolume(volume);
  }

  public getVolume(): number {
    return RTCMediaElementManager.instance().getVolume();
  }

  public setMediaDeviceDelegate(delegate: IRTCMediaDeviceDelegate): void {
    RTCMediaDeviceManager.instance().setMediaDeviceDelegate(delegate);
  }

  public getAudioInputs(): MediaDeviceInfo[] {
    return RTCMediaDeviceManager.instance().getAudioInputs();
  }

  public getAudioOutputs(): MediaDeviceInfo[] {
    return RTCMediaDeviceManager.instance().getAudioOutputs();
  }

  public getCurrentAudioInput() {
    return RTCMediaDeviceManager.instance().getCurrentAudioInput();
  }

  public setCurrentAudioInput(deviceId: string) {
    return RTCMediaDeviceManager.instance().setAudioInputDevice(deviceId);
  }

  public getCurrentAudioOutput() {
    return RTCMediaDeviceManager.instance().getCurrentAudioOutput();
  }

  public setCurrentAudioOutput(deviceId: string) {
    return RTCMediaDeviceManager.instance().setAudioOutputDevice(deviceId);
  }

  public getDefaultDeviceId(devices: MediaDeviceInfo[]) {
    return RTCMediaDeviceManager.instance().getDefaultDeviceId(devices);
  }
}

export { RTCEngine };
