/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-01-10 16:22:42
 * Copyright © RingCentral. All rights reserved.
 */

import { RTC_CALL_STATE } from '../api/types';
import { RTCCall } from '../api/RTCCall';
import { kRTCMaxCallCount } from './constants';
import { rtcLogger } from '../utils/RTCLoggerProxy';
import { ALLOW_CALL_FLAG } from './types';

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
      return item.getCallInfo().uuid !== callUuid;
    });
    rtcLogger.debug(
      LOG_TAG,
      `Call ${callUuid} removed from call manager. Calls: ${
        this._calls.length
      }`,
    );
  }

  allowCall(flag: ALLOW_CALL_FLAG = ALLOW_CALL_FLAG.OUTBOUND_CALL): boolean {
    if (kRTCMaxCallCount === this._calls.length) {
      if (ALLOW_CALL_FLAG.OUTBOUND_CALL === flag) {
        rtcLogger.warn(
          LOG_TAG,
          'Not allow call. Max simple multiple outbound call count is reached',
        );
        return false;
      }
      if (ALLOW_CALL_FLAG.EXTRA_OUTBOUND_CALL === flag) {
        rtcLogger.info(
          LOG_TAG,
          'allow call. it is extra outbound call and there is a call now.',
        );
        return true;
      }
      if (this.connectedCallCount() === 0) {
        rtcLogger.warn(
          LOG_TAG,
          'Not allow call. there is not connected call when receive incoming call',
        );
        return false;
      }
      rtcLogger.info(
        LOG_TAG,
        'allow call. it is incoming call and there is a connected call now.',
      );
      return true;
    }
    if (this._calls.length > kRTCMaxCallCount) {
      rtcLogger.warn(
        LOG_TAG,
        'Not allow call. Max simple multiple call count is reached',
      );
      return false;
    }
    rtcLogger.info(LOG_TAG, 'allow call. Max call count is not reached.');
    return true;
  }

  callList(): RTCCall[] {
    return this._calls;
  }

  callCount(): number {
    return this._calls.length;
  }

  connectedCallList(): RTCCall[] {
    return this._calls.filter(
      (item: RTCCall) => item.getCallState() === RTC_CALL_STATE.CONNECTED,
    );
  }

  connectedCallCount(): number {
    return this.connectedCallList().length;
  }

  getCallByUuid(callUuid: string): RTCCall | null {
    return this._calls.find(
      (call: any) => call.getCallInfo().uuid === callUuid,
    ) || null;
  }

  notifyAccountReady() {
    this._calls.forEach((call: RTCCall) => {
      call.onAccountReady();
    });
  }

  endAllCalls() {
    this._calls.forEach((call: RTCCall) => {
      call.hangup();
    });
  }
}

export { RTCCallManager };
