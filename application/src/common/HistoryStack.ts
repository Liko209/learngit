/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-16 10:55:00
 * Copyright © RingCentral. All rights reserved.
 */
import { action, observable, computed } from 'mobx';
import { getMessagesTitle } from '@/common/getDocTitle';

const MAX_RECORD = 11;
const MESSAGES_CATEGORY_ROUTER = 'messages';

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
    return this.stack.slice(0, this.cursor);
  }

  @computed
  get forwardRecord() {
    return this.stack.slice(this.cursor + 1);
  }

  @action
  updateStackNCursor() {
    this._stack = this.stack;
    this._cursor = this.cursor;
  }

  isInvalidPath(pathname: string) {
    const [, category, subPath] = pathname.split('/');
    return category.toLocaleLowerCase() === MESSAGES_CATEGORY_ROUTER && !getMessagesTitle(subPath);
  }

  get cursor() {
    let current = this._cursor;
    const cursors = this._stack.reduce((
      cursors: number[],
      pathname: string,
      index: number,
    ) => {
      if (this.isInvalidPath(pathname)) {
        cursors.push(index);
      }
      return cursors;
    },                                 []);
    cursors.forEach((value: number) => {
      if (value <= this._cursor) {
        current -= 1;
      }
    });
    return current;
  }

  get stack() {
    const stack = this._stack.reduce((
      stack: string[],
      pathname: string,
    ) => {
      if (!this.isInvalidPath(pathname)) {
        stack.push(pathname);
      }
      return stack;
    },                               []);
    return stack;
  }

  getCurrentPathname() {
    return this.stack[this.cursor];
  }

  @action
  clear() {
    this._cursor = -1;
    this._stack = [];
  }
}

export default new HistoryStack();
export { HistoryStack };
