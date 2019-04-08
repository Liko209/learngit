/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-05 10:41:15
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCUserAgentInfo } from './types';
import { RTCAccount } from './RTCAccount';
import { IRTCAccountDelegate } from './IRTCAccountDelegate';
import { IRTCLogger } from '../utils/IRTCLogger';
import { rtcLogger } from '../utils/RTCLoggerProxy';
import { RTCRestApiManager } from '../utils/RTCRestApiManager';
import { RTCDaoManager } from '../utils/RTCDaoManager';
import { RTCMediaDeviceManager } from './RTCMediaDeviceManager';
import { ITelephonyNetworkDelegate, ITelephonyDaoDelegate } from 'foundation';
import { RTCMediaManager } from '../utils/RTCMediaManager';
import { IRTCMediaDeviceDelegate } from './IRTCMediaDeviceDelegate';

class RTCEngine {
  private static _instance: RTCEngine | null;
  private _userAgentInfo: RTCUserAgentInfo;

  public static getInstance(info?: RTCUserAgentInfo) {
    if (!RTCEngine._instance) {
      RTCEngine._instance = new RTCEngine(info);
    }
    return RTCEngine._instance;
  }

  protected constructor(info?: RTCUserAgentInfo) {
    if (info) {
      this._userAgentInfo = info;
    }
    RTCMediaDeviceManager.instance().updateMediaDevices();
    RTCMediaDeviceManager.instance().subscribeDeviceChange();
  }

  public destroy() {
    RTCMediaDeviceManager.instance().destroy();
    RTCEngine._instance = null;
  }

  public createAccount(delegate: IRTCAccountDelegate): RTCAccount {
    return new RTCAccount(delegate, this._userAgentInfo);
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
    RTCMediaManager.instance().setVolume(volume);
  }

  public getVolume(): number {
    return RTCMediaManager.instance().getVolume();
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

  public updateMediaDevices(): void {
    RTCMediaDeviceManager.instance().updateMediaDevices();
  }
}

export { RTCEngine };
