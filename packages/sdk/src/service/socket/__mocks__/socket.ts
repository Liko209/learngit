/*
 * @Author: Lily.li (lily.li@ringcentral.com)
 * @Date: 2018-06-27 14:12:57
 * Copyright © RingCentral. All rights reserved.
 */

class SocketIO {
  _reconnection: boolean = true;
  reconnection(v: boolean) {
    this._reconnection = v;
  }
}

export default class Socket {
  io: SocketIO;
  _subs: object = {};
  connect = jest.fn();
  disconnect = jest.fn();
  close = jest.fn();
  open = jest.fn();
  removeAllListeners = jest.fn();
  removeEventListener = jest.fn();
  destroy = jest.fn();

  constructor() {
    this.io = new SocketIO();
  }
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
