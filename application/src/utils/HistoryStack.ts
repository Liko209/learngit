/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-16 10:55:00
 * Copyright © RingCentral. All rights reserved.
 */
import { action, observable, computed } from 'mobx';

class HistoryStack {
  @observable
  private _cursor: number = -1;
  @observable
  private _stack: string[] = [];

  @action
  push(pathname: string) {
    if (this._stack.length !== this._cursor + 1) {
      this._stack.length = this._cursor + 1;
    }
    this._stack.push(pathname);
    this._cursor += 1;
  }

  @action
  replace(pathname: string) {
    if (this._cursor < 0) {
      this._cursor = 0;
    }
    this._stack[this._cursor] = pathname;
  }

  @action
  setCursor(pointer: number) {
    this._cursor = pointer;
  }

  @computed
  get backRecord() {
    return this._stack.slice(0, this._cursor);
  }

  @computed
  get forwardRecord() {
    return this._stack.slice(this._cursor + 1);
  }

  getCursor() {
    return this._cursor;
  }

  getStack() {
    return this._stack;
  }

  getCurrentPathname() {
    return this._stack[this._cursor];
  }
}

export default new HistoryStack();
export { HistoryStack };
