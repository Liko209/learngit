/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:52:56
 * Copyright © RingCentral. All rights reserved.
 */

import { EventEmitter2 } from 'eventemitter2';
import {
  RTC_NETWORK_EVENT,
  RTC_NETWORK_STATE,
  RTC_SLEEP_MODE_EVENT,
} from './types';
import { sleepModeDetector } from 'foundation';
import { kSleepModeDetectorKey } from './constants';

class RTCNetworkNotificationCenter extends EventEmitter2 {
  private static _singleton: RTCNetworkNotificationCenter | null = null;
  private _isOnline: boolean = true;

  public static instance(): RTCNetworkNotificationCenter {
    if (!RTCNetworkNotificationCenter._singleton) {
      RTCNetworkNotificationCenter._singleton = new RTCNetworkNotificationCenter();
    }
    return RTCNetworkNotificationCenter._singleton;
  }

  public destroy() {
    sleepModeDetector.unSubscribe(kSleepModeDetectorKey);
    RTCNetworkNotificationCenter._singleton = null;
  }

  private constructor() {
    super();
    this._listenEvevt();
  }

  private _onOnline() {
    this._isOnline = true;
    this.emit(RTC_NETWORK_EVENT.NETWORK_CHANGE, {
      state: RTC_NETWORK_STATE.ONLINE,
    });
  }

  private _onOffline() {
    this._isOnline = false;
    this.emit(RTC_NETWORK_EVENT.NETWORK_CHANGE, {
      state: RTC_NETWORK_STATE.OFFLINE,
    });
  }

  private _listenEvevt() {
    window.addEventListener('online', () => {
      this._onOnline();
    });
    window.addEventListener('offline', () => {
      this._onOffline();
    });
    sleepModeDetector.subScribe(kSleepModeDetectorKey, (interval: number) => {
      this._onWakeUpFromSleepMode();
    });
  }

  private _onWakeUpFromSleepMode() {
    this.emit(RTC_SLEEP_MODE_EVENT.WAKE_UP_FROM_SLEEP_MODE);
  }

  public isOnline() {
    return this._isOnline;
  }
}

export { RTCNetworkNotificationCenter };
