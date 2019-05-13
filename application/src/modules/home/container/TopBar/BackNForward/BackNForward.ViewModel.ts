/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-16 15:04:14
 * Copyright © RingCentral. All rights reserved.
 */
import { promisedComputed } from 'computed-async-mobx';
import { action, computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import history from '@/history';
import historyStack from '@/common/HistoryStack';
import getDocTitle from '@/common/getDocTitle';
import { OPERATION } from 'jui/pattern/HistoryOperation';

class BackNForwardViewModel extends StoreViewModel {
  @action
  forward = () => {
    const pointer = historyStack.getCursor();
    const stack = historyStack.getStack();
    if (pointer + 1 === stack.length) {
      return;
    }

    this._setHistoryStackPointer(pointer + 1);
  }

  @action
  back = () => {
    const pointer = historyStack.getCursor();
    if (pointer - 1 < 0) {
      return;
    }

    this._setHistoryStackPointer(pointer - 1);
  }

  @computed
  get rawBackRecord() {
    const backRecord = historyStack.backRecord;
    return backRecord.map((pathname: string) => ({
      pathname,
      title: pathname,
    }));
  }

  @computed
  get rawForwardRecord() {
    const forwardRecord = historyStack.forwardRecord;
    return forwardRecord.map((pathname: string) => ({
      pathname,
      title: pathname,
    }));
  }

  backRecord = promisedComputed(this.rawBackRecord, async () => {
    const backRecord = historyStack.backRecord;
    const promiseRecord = backRecord.map(async (pathname: string) => ({
      pathname,
      title: await getDocTitle(pathname),
    }));
    return await Promise.all(promiseRecord);
  });

  forwardRecord = promisedComputed(this.rawForwardRecord, async () => {
    const forwardRecord = historyStack.forwardRecord;
    const promiseRecord = forwardRecord.map(async (pathname: string) => ({
      pathname,
      title: await getDocTitle(pathname),
    }));
    return await Promise.all(promiseRecord);
  });

  @computed
  get disabledBack() {
    return this.rawBackRecord.length === 0;
  }

  @computed
  get disabledForward() {
    return this.rawForwardRecord.length === 0;
  }

  @action
  private _setHistoryStackPointer(pointer: number) {
    historyStack.setCursor(pointer);
    const stack = historyStack.getStack();
    const pathname = stack[pointer];
    history.push(pathname, {
      navByBackNForward: true,
    });
  }

  @action
  go = (type: OPERATION, index: number) => {
    let pointer = historyStack.getCursor();
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
