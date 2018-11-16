/*
 * @Author: steven.zhuang
 * @Date: 2018-11-14 14:00:08
 * Copyright © RingCentral. All rights reserved.
 */

class SplitIOSdkClient {
  _subs: object = {};
  Event: object = {
    SDK_READY: 'SDK_READY',
    SDK_UPDATE: 'SDK_UPDATE',
  };
  getTreatments = jest.fn(() => {
    return { telephony: 'on' };
  });

  destroy = jest.fn();
  removeAllListeners = jest.fn();

  constructor() {}

  emit(event: string, props: object) {
    for (const e in this._subs) {
      if (e === event) {
        this._subs[e].forEach((el: Function) => {
          el(props);
        });
      }
    }
  }
  on(event: string, callback: Function) {
    this._subs[event]
      ? this._subs[event].push(callback)
      : (this._subs[event] = [callback]);
  }
}

export { SplitIOSdkClient };
