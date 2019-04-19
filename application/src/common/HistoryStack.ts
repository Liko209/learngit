/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-16 10:55:00
 * Copyright © RingCentral. All rights reserved.
 */
import { action, observable, computed } from 'mobx';

const MAX_RECORD = 11;
class HistoryStack {
  @observable
  private _cursor: number = -1;
  @observable
  private _stack: string[] = [];

  @action
  push(pathname: string) {
    // check if need to push, if already have same as last, do nothing.
    if (this._stack.length > 0) {
      const last = this._stack[this._stack.length - 1];
      if (last === pathname) {
        return;
      }
    }
    if (this._stack.length !== this._cursor + 1) {
      this._stack.length = this._cursor + 1;
    }
    if (this._cursor < MAX_RECORD - 1) {
      this._stack.push(pathname);
      this._cursor += 1;
      return;
    }
    const newStack = this._stack.splice(1);
    newStack.push(pathname);
    this._stack = newStack;
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

  @action
  clear() {
    this._cursor = -1;
    this._stack = [];
  }
}

export default new HistoryStack();
export { HistoryStack };
