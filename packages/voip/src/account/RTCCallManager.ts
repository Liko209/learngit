/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-01-10 16:22:42
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCCall } from '../api/RTCCall';
import { kRTCMaxCallCount } from './constants';
import { rtcLogger } from '../utils/RTCLoggerProxy';

class RTCCallManager {
  private _kTag: string = 'RTCCallManager';
  private _calls: RTCCall[] = [];
  constructor() {}

  addCall(call: RTCCall) {
    this._calls.push(call);
    rtcLogger.debug(
      this._kTag,
      `Call ${call.getCallInfo().uuid} added into call manager. Calls: ${
        this._calls.length
      }`,
    );
  }

  removeCall(callUuid: string) {
    this._calls.forEach((item, index) => {
      if (item.getCallInfo().uuid === callUuid) {
        this._calls.splice(index, 1);
      }
    });
    rtcLogger.debug(
      this._kTag,
      `Call ${callUuid} removed from call manager. Calls: ${this._calls.length}`,
    );
  }

  allowCall(): boolean {
    if (this._calls.length >= kRTCMaxCallCount) {
      return false;
    }
    return true;
  }

  callList(): RTCCall[] {
    return this._calls;
  }

  callCount(): number {
    return this._calls.length;
  }

  getCallByUuid(callUuid: string): RTCCall {
    this._calls.forEach((item: any) => {
      if (item.getCallInfo().uuid === callUuid) {
        return item;
      }
    });
    return null as any;
  }
}

export { RTCCallManager };
