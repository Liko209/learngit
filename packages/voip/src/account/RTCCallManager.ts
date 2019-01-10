/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-01-10 16:22:42
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCCall } from '../api/RTCCall';
import { kRTCMaxCallCount } from './constants';

class RTCCallManager {
  private _calls: RTCCall[];
  constructor() {}

  addCall(call: RTCCall) {
    this._calls.push(call);
  }

  removeCall(call: RTCCall) {
    this._calls.forEach((item, index) => {
      if (item === call) {
        this._calls.slice(index, 1);
      }
    });
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
}

export { RTCCallManager };
