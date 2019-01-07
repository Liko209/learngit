/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:52:56
 * Copyright © RingCentral. All rights reserved.
 */

import { EventEmitter2 } from 'eventemitter2';

import { RTC_NETWORK_EVENT, RTC_NETWORK_STATE } from './types';

class RTCNetworkNotificationCenter extends EventEmitter2 {
  private _isOnline: boolean = true;

  constructor() {
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
  }

  public isOnline() {
    return this._isOnline;
  }
}

const rtcNetworkNotificationCenter: RTCNetworkNotificationCenter = new RTCNetworkNotificationCenter();

export { rtcNetworkNotificationCenter };
