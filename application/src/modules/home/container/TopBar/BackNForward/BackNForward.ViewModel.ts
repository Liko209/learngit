/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-16 15:04:14
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import history from '@/history';
import historyStack from '@/common/HistoryStack';
import getDocTitle from '@/common/getDocTitle';
import { OPERATION } from 'jui/pattern/HistoryOperation';

class BackNForwardViewModel extends StoreViewModel {
  @action
  forward = () => {
    const pointer = historyStack.cursor;
    const stack = historyStack.stack;
    if (pointer + 1 === stack.length) {
      return;
    }

    this._setHistoryStackPointer(pointer + 1);
  }

  @action
  back = () => {
    const pointer = historyStack.cursor;
    if (pointer - 1 < 0) {
      return;
    }

    this._setHistoryStackPointer(pointer - 1);
  }

  @computed
  get backRecord() {
    return historyStack.backRecord.map((pathname: string) => ({
      pathname,
      title: getDocTitle(pathname),
    }));
  }

  @computed
  get forwardRecord() {
    return historyStack.forwardRecord.map((pathname: string) => ({
      pathname,
      title: getDocTitle(pathname),
    }));
  }

  @computed
  get disabledBack() {
    return this.backRecord.length === 0;
  }

  @computed
  get disabledForward() {
    return this.forwardRecord.length === 0;
  }

  @action
  private _setHistoryStackPointer(pointer: number) {
    historyStack.setCursor(pointer);
    const stack = historyStack.stack;
    const pathname = stack[pointer];
    history.push(pathname, {
      navByBackNForward: true,
    });
  }

  @action
  go = (type: OPERATION, index: number) => {
    let pointer = historyStack.cursor;
    if (type === OPERATION.BACK) {
      pointer = pointer - index - 1;
    }
    if (type === OPERATION.FORWARD) {
      pointer = pointer + index + 1;
    }

    this._setHistoryStackPointer(pointer);
  }
}
export { BackNForwardViewModel };
