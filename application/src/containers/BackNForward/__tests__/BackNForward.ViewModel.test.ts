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
  beforeEach(() => {
    historyStack.clear();
  });
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
    historyStack.push('text1');
    historyStack.push('text2');
    historyStack.push('text3');
    historyStack.push('text4');
    historyStack.push('text5');
    historyStack.push('text6');
    historyStack.push('text7');
    historyStack.push('text8');
    historyStack.push('text9');
    historyStack.push('text10');
    historyStack.push('text11');
    historyStack.push('text12');
    historyStack.push('text13');
    historyStack.push('text14');
    historyStack.push('text15');
    historyStack.push('text16');
    historyStack.push('text17');
    historyStack.push('text18');
    historyStack.push('text19');
    historyStack.push('text20');
    historyStack.push('text21');

    const backRecord = backNForwardViewModel.backRecord;
    expect(backRecord).toEqual([
      {
        pathname: 'text11',
        title: 'text11',
      },
      {
        pathname: 'text12',
        title: 'text12',
      },
      {
        pathname: 'text13',
        title: 'text13',
      },
      {
        pathname: 'text14',
        title: 'text14',
      },
      {
        pathname: 'text15',
        title: 'text15',
      },
      {
        pathname: 'text16',
        title: 'text16',
      },
      {
        pathname: 'text17',
        title: 'text17',
      },
      {
        pathname: 'text18',
        title: 'text18',
      },
      {
        pathname: 'text19',
        title: 'text19',
      },
      {
        pathname: 'text20',
        title: 'text20',
      },
    ]);
  });

  it('Should return forwardRecord record', () => {
    historyStack.push('text1');
    historyStack.push('text2');
    historyStack.push('text3');
    historyStack.push('text4');
    historyStack.push('text5');
    historyStack.push('text6');
    historyStack.push('text7');
    historyStack.push('text8');
    historyStack.push('text9');
    historyStack.push('text10');
    historyStack.push('text11');
    historyStack.push('text12');
    historyStack.push('text13');
    historyStack.push('text14');
    historyStack.push('text15');
    historyStack.push('text16');
    historyStack.push('text17');
    historyStack.push('text18');
    historyStack.push('text19');
    historyStack.push('text20');
    historyStack.push('text21');

    historyStack.setCursor(3);
    const forwardRecord = backNForwardViewModel.forwardRecord;
    expect(forwardRecord).toEqual([
      {
        pathname: 'text5',
        title: 'text5',
      },
      {
        pathname: 'text6',
        title: 'text6',
      },
      {
        pathname: 'text7',
        title: 'text7',
      },
      {
        pathname: 'text8',
        title: 'text8',
      },
      {
        pathname: 'text9',
        title: 'text9',
      },
      {
        pathname: 'text10',
        title: 'text10',
      },
      {
        pathname: 'text11',
        title: 'text11',
      },
      {
        pathname: 'text12',
        title: 'text12',
      },
      {
        pathname: 'text13',
        title: 'text13',
      },
      {
        pathname: 'text14',
        title: 'text14',
      },
    ]);
  });

  it('Should return current status of back button', () => {
    historyStack.push('text');
    historyStack.push('text');

    let disabledBack = backNForwardViewModel.disabledBack;
    expect(disabledBack).toEqual(false);
    historyStack.setCursor(0);
    disabledBack = backNForwardViewModel.disabledBack;
    expect(disabledBack).toEqual(true);
  });

  it('Should return current status of forward button', () => {
    historyStack.push('text');
    historyStack.push('text');

    let disabledForward = backNForwardViewModel.disabledForward;
    expect(disabledForward).toEqual(true);
    historyStack.setCursor(0);
    disabledForward = backNForwardViewModel.disabledForward;
    expect(disabledForward).toEqual(false);
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
