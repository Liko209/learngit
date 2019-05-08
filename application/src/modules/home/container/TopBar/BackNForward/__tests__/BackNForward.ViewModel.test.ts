/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-17 14:17:32
 * Copyright © RingCentral. All rights reserved.
 */
import historyStack from '@/common/HistoryStack';
import { OPERATION } from 'jui/pattern/HistoryOperation';
import { BackNForwardViewModel } from '../BackNForward.ViewModel';

const backNForwardViewModel = new BackNForwardViewModel();

jest.mock('@/common/getDocTitle', () => (pathname: string) => pathname);

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
    historyStack.push('text1');
    let oldCursor = historyStack.getCursor();
    backNForwardViewModel.back();
    let newCursor = historyStack.getCursor();

    expect(newCursor).toBe(oldCursor - 1);

    oldCursor = historyStack.getCursor();
    backNForwardViewModel.forward();
    newCursor = historyStack.getCursor();
    expect(newCursor).toBe(oldCursor + 1);
  });

  it('Should return back record', async (done: jest.DoneCallback) => {
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

    const backRecord = await backNForwardViewModel.backRecord.fetch();
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
    done();
  });

  it('Should return forwardRecord record', async (done: jest.DoneCallback) => {
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
    const forwardRecord = await backNForwardViewModel.forwardRecord.fetch();
    expect(forwardRecord).toEqual([
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
      {
        pathname: 'text21',
        title: 'text21',
      },
    ]);
    done();
  });

  it('Should return current status of back button', () => {
    historyStack.push('text');
    historyStack.push('text1');

    let disabledBack = backNForwardViewModel.disabledBack;
    expect(disabledBack).toEqual(false);
    historyStack.setCursor(0);
    disabledBack = backNForwardViewModel.disabledBack;
    expect(disabledBack).toEqual(true);
  });

  it('Should return current status of forward button', () => {
    historyStack.push('text');
    historyStack.push('text1');

    let disabledForward = backNForwardViewModel.disabledForward;
    expect(disabledForward).toEqual(true);
    historyStack.setCursor(0);
    disabledForward = backNForwardViewModel.disabledForward;
    expect(disabledForward).toEqual(false);
  });

  it('Can set cursor by go', async (done: jest.DoneCallback) => {
    historyStack.push('text');
    historyStack.push('text1');

    backNForwardViewModel.go(OPERATION.BACK, 0);
    let backRecord = await backNForwardViewModel.backRecord.fetch();
    let forwardRecord = await backNForwardViewModel.forwardRecord.fetch();

    expect(backRecord.length).toBe(0);
    expect(forwardRecord.length).toBe(1);

    backNForwardViewModel.go(OPERATION.FORWARD, 0);
    backRecord = await backNForwardViewModel.backRecord.fetch();
    forwardRecord = await backNForwardViewModel.forwardRecord.fetch();
    expect(backRecord.length).toBe(1);
    expect(forwardRecord.length).toBe(0);
    done();
  });
});
