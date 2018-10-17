/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-17 14:17:32
 * Copyright © RingCentral. All rights reserved.
 */
import historyStack from '@/utils/HistoryStack';
import { OPERATION } from 'jui/pattern/HistoryOperation';
import { BackNForwardViewModel } from '../BackNForward.ViewModel';

const backNForwardViewModel = new BackNForwardViewModel();

jest.mock('@/utils/getDocTitle', () => (pathname: string) => pathname);

describe('backNForward ViewModel', () => {
  it('Should not change history stack cursor when history stack cursor is in the history stack start or end ', () => {
    let oldCursor = historyStack.getCursor();
    backNForwardViewModel.forward();
    let newCursor = historyStack.getCursor();
    expect(newCursor).toBe(oldCursor);

    oldCursor = historyStack.getCursor();
    backNForwardViewModel.back();
    newCursor = historyStack.getCursor();
    expect(newCursor).toBe(oldCursor);
  });

  it('Should make history stack cursor + 1 or - 1', () => {
    historyStack.push('text');
    historyStack.push('text');
    let oldCursor = historyStack.getCursor();
    backNForwardViewModel.back();
    let newCursor = historyStack.getCursor();

    expect(newCursor).toBe(oldCursor - 1);

    oldCursor = historyStack.getCursor();
    backNForwardViewModel.forward();
    newCursor = historyStack.getCursor();
    expect(newCursor).toBe(oldCursor + 1);
  });

  it('Should return back record', () => {
    historyStack.push('text');
    historyStack.push('text');
    historyStack.push('text');

    const backRecord = backNForwardViewModel.backRecord;
    expect(backRecord).toEqual([
      {
        pathname: 'text',
        title: 'text',
      },
      {
        pathname: 'text',
        title: 'text',
      },
    ]);
  });

  it('Should return forwardRecord record', () => {
    historyStack.push('text');
    historyStack.push('text');
    historyStack.push('text');

    historyStack.setCursor(0);
    const forwardRecord = backNForwardViewModel.forwardRecord;
    expect(forwardRecord).toEqual([
      {
        pathname: 'text',
        title: 'text',
      },
      {
        pathname: 'text',
        title: 'text',
      },
    ]);
  });

  it('Should return current status of back button', () => {
    historyStack.push('text');
    historyStack.push('text');

    let disabledBack = backNForwardViewModel.disabledBack;
    expect(disabledBack).toEqual(true);
    historyStack.setCursor(0);
    disabledBack = backNForwardViewModel.disabledBack;
    expect(disabledBack).toEqual(false);
  });

  it('Should return current status of forward button', () => {
    historyStack.push('text');
    historyStack.push('text');

    let disabledBack = backNForwardViewModel.disabledBack;
    expect(disabledBack).toEqual(false);
    historyStack.setCursor(0);
    disabledBack = backNForwardViewModel.disabledBack;
    expect(disabledBack).toEqual(true);
  });

  it('Can set cursor by go', () => {
    historyStack.push('text');
    historyStack.push('text');

    backNForwardViewModel.go(OPERATION.BACK, 0);
    let backRecord = backNForwardViewModel.backRecord;
    let forwardRecord = backNForwardViewModel.forwardRecord;

    expect(backRecord.length).toBe(0);
    expect(forwardRecord.length).toBe(1);

    backNForwardViewModel.go(OPERATION.FORWARD, 0);
    backRecord = backNForwardViewModel.backRecord;
    forwardRecord = backNForwardViewModel.forwardRecord;
    expect(backRecord.length).toBe(1);
    expect(forwardRecord.length).toBe(0);
  });
});
