/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-16 10:55:00
 * Copyright © RingCentral. All rights reserved.
 */
import { action, observable, computed } from 'mobx';

class HistoryStack {
  @observable
  private _pointer: number = -1;
  @observable
  private _stack: string[] = [];

  @action
  push(pathname: string) {
    if (this._stack.length !== this._pointer + 1) {
      this._stack.length = this._pointer + 1;
    }
    this._stack.push(pathname);
    this._pointer += 1;
  }

  @action
  replace(pathname: string) {
    if (this._pointer < 0) {
      this._pointer = 0;
    }
    this._stack[this._pointer] = pathname;
  }

  @action
  setPointer(pointer: number) {
    this._pointer = pointer;
  }

  @computed
  get backRecord() {
    return this._stack.slice(0, this._pointer);
  }

  @computed
  get forwardRecord() {
    return this._stack.slice(this._pointer + 1);
  }

  getPointer() {
    return this._pointer;
  }

  getStack() {
    return this._stack;
  }

  getCurrentPathname() {
    return this._stack[this._pointer];
  }
}

export default new HistoryStack();
export { HistoryStack };
