/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-01-10 16:22:42
 * Copyright © RingCentral. All rights reserved.
 */

import { RTC_CALL_STATE } from '../api/types';
import { RTCCall } from '../api/RTCCall';
import { kRTCMaxCallCount } from './constants';
import { rtcLogger } from '../utils/RTCLoggerProxy';

const LOG_TAG = 'RTCCallManager';
class RTCCallManager {
  private _calls: RTCCall[] = [];

  addCall(call: RTCCall) {
    this._calls.push(call);
    rtcLogger.debug(
      LOG_TAG,
      `Call ${call.getCallInfo().uuid} added into call manager. Calls: ${
        this._calls.length
      }`,
    );
  }

  removeCall(callUuid: string) {
    this._calls = this._calls.filter((item: RTCCall) => {
      item.getCallInfo().uuid !== callUuid;
    });
    rtcLogger.debug(
      LOG_TAG,
      `Call ${callUuid} removed from call manager. Calls: ${this._calls.length}`,
    );
  }

  allowCall(): boolean {
    return this._calls.length < kRTCMaxCallCount;
  }

  callList(): RTCCall[] {
    return this._calls;
  }

  callCount(): number {
    return this._calls.length;
  }

  connectedCallList(): RTCCall[] {
    const connectedCalls: RTCCall[] = [];
    this._calls.forEach((item: RTCCall) => {
      if (item.getCallState() === RTC_CALL_STATE.CONNECTED) {
        connectedCalls.push(item);
      }
    });
    return connectedCalls;
  }

  connectedCallCount(): number {
    return this.connectedCallList().length;
  }

  getCallByUuid(callUuid: string): RTCCall | null {
    this._calls.forEach((item: any) => {
      if (item.getCallInfo().uuid === callUuid) {
        return item;
      }
    });
    return null;
  }

  notifyAccountReady() {
    this._calls.forEach((item: RTCCall) => {
      item.onAccountReady();
    });
  }
}

export { RTCCallManager };
