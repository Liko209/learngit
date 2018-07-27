/*
 * @Author: Lily.li (lily.li@ringcentral.com)
 * @Date: 2018-06-27 14:12:57
 * Copyright © RingCentral. All rights reserved.
 */

export default class Socket {
  _subs: object = {};
  connect = jest.fn();
  disconnect = jest.fn();
  close = jest.fn();
  open = jest.fn();
  removeAllListeners = jest.fn();
  emit(event: string, props: object) {
    for (let e in this._subs) {
      if (e === event) {
        this._subs[e].forEach((el: Function) => {
          el(props);
        });
      }
    }
  }
  on(event: string, callback: Function) {
    this._subs[event] ? this._subs[event].push(callback) : (this._subs[event] = [callback]);
  }
}
