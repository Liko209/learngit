/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-17 14:17:32
 * Copyright © RingCentral. All rights reserved.
 */
import { times } from 'lodash';
import { testable, test } from 'shield';
import historyStack from '@/common/HistoryStack';
import { OPERATION } from 'jui/pattern/HistoryOperation';
import { BackNForwardViewModel } from '../BackNForward.ViewModel';

const INVALID_GROUP = 'INVALID_GROUP';

jest.mock('@/common/getDocTitle', () => ({
  getDocTitle: (pathname: string) => {
    if (pathname.includes('INVALID_GROUP')) {
      return undefined;
    }
    return pathname.split('/')[2];
  },
  getMessagesTitle: (messagePath: string) => {
    if (messagePath.includes('INVALID_GROUP')) {
      return undefined;
    }
    return messagePath;
  },
}));

const backNForwardViewModel = new BackNForwardViewModel();

jest.mock('@/utils/i18nT', () => ({
  i18nP: (key: string) => key,
}));

describe('backNForward ViewModel', () => {
  beforeEach(() => {
    historyStack.clear();
  });
  @testable
  class cursor {
    @test(
      'should not change history stack cursor when history stack cursor is in the history stack start or end',
    )
    t1() {
      let oldCursor = historyStack.cursor;
      backNForwardViewModel.forward();
      let newCursor = historyStack.cursor;
      expect(newCursor).toBe(oldCursor);

      oldCursor = historyStack.cursor;
      backNForwardViewModel.back();
      newCursor = historyStack.cursor;
      expect(newCursor).toBe(oldCursor);
    }

    @test('should make history stack cursor + 1 or - 1 when execute back or forward')
    t2() {
      historyStack.push('/messages/text');
      historyStack.push('/messages/text1');
      let oldCursor = historyStack.cursor;
      backNForwardViewModel.back();
      let newCursor = historyStack.cursor;

      expect(newCursor).toBe(oldCursor - 1);

      oldCursor = historyStack.cursor;
      backNForwardViewModel.forward();
      newCursor = historyStack.cursor;
      expect(newCursor).toBe(oldCursor + 1);
    }
  }

  @testable
  class backRecord {
    @test('should return correct record when get backRecord')
    t1() {
      times(22, (value: number) => {
        historyStack.push(`/messages/${value}`);
      });
      const backRecord = backNForwardViewModel.backRecord;
      expect(backRecord).toEqual([
        {
          pathname: '/messages/11',
          title: '11',
        },
        {
          pathname: '/messages/12',
          title: '12',
        },
        {
          pathname: '/messages/13',
          title: '13',
        },
        {
          pathname: '/messages/14',
          title: '14',
        },
        {
          pathname: '/messages/15',
          title: '15',
        },
        {
          pathname: '/messages/16',
          title: '16',
        },
        {
          pathname: '/messages/17',
          title: '17',
        },
        {
          pathname: '/messages/18',
          title: '18',
        },
        {
          pathname: '/messages/19',
          title: '19',
        },
        {
          pathname: '/messages/20',
          title: '20',
        },
      ]);
    }

    @test('should return correct record when there exists invalid group')
    t2() {
      times(13, (value: number) => {
        historyStack.push(`/messages/${value}`);
      });
      historyStack.push(`/messages/${INVALID_GROUP}`);
      times(8, (value: number) => {
        historyStack.push(`/messages/${value + 13}`);
      });
      const backRecord = backNForwardViewModel.backRecord;
      expect(backRecord).toEqual([
        {
          pathname: '/messages/11',
          title: '11',
        },
        {
          pathname: '/messages/12',
          title: '12',
        },
        {
          pathname: '/messages/13',
          title: '13',
        },
        {
          pathname: '/messages/14',
          title: '14',
        },
        {
          pathname: '/messages/15',
          title: '15',
        },
        {
          pathname: '/messages/16',
          title: '16',
        },
        {
          pathname: '/messages/17',
          title: '17',
        },
        {
          pathname: '/messages/18',
          title: '18',
        },
        {
          pathname: '/messages/19',
          title: '19',
        },
      ]);
    }
  }

  @testable
  class forwardRecord {
    @test('should return correct record when get forwardRecord')
    t1() {
      times(22, (value: number) => {
        historyStack.push(`/messages/${value}`);
      });
      historyStack.setCursor(3);
      const forwardRecord = backNForwardViewModel.forwardRecord;
      expect(forwardRecord).toEqual([
        {
          pathname: '/messages/15',
          title: '15',
        },
        {
          pathname: '/messages/16',
          title: '16',
        },
        {
          pathname: '/messages/17',
          title: '17',
        },
        {
          pathname: '/messages/18',
          title: '18',
        },
        {
          pathname: '/messages/19',
          title: '19',
        },
        {
          pathname: '/messages/20',
          title: '20',
        },
        {
          pathname: '/messages/21',
          title: '21',
        },
      ]);
    }

    @test('should return correct record when there exists invalid group')
    t2() {
      times(17, (value: number) => {
        historyStack.push(`/messages/${value}`);
      });
      historyStack.push(`/messages/${INVALID_GROUP}`);
      times(6, (value: number) => {
        historyStack.push(`/messages/${value + 17}`);
      });
      historyStack.setCursor(3);
      const forwardRecord = backNForwardViewModel.forwardRecord;
      expect(forwardRecord).toEqual([
        {
          pathname: '/messages/17',
          title: '17',
        },
        {
          pathname: '/messages/18',
          title: '18',
        },
        {
          pathname: '/messages/19',
          title: '19',
        },
        {
          pathname: '/messages/20',
          title: '20',
        },
        {
          pathname: '/messages/21',
          title: '21',
        },
        {
          pathname: '/messages/22',
          title: '22',
        },
      ]);
    }
  }

  @testable
  class disabledBack {
    @test('should return current status when get back button status')
    t1() {
      historyStack.push('/messages/text');
      historyStack.push('/messages/text1');

      let disabledBack = backNForwardViewModel.disabledBack;
      expect(disabledBack).toEqual(false);

      historyStack.setCursor(0);
      disabledBack = backNForwardViewModel.disabledBack;
      expect(disabledBack).toEqual(true);
    }

    @test('should return current status when get back forward status')
    t2() {
      historyStack.push('/messages/text');
      historyStack.push('/messages/text1');

      let disabledForward = backNForwardViewModel.disabledForward;
      expect(disabledForward).toEqual(true);
      historyStack.setCursor(0);
      disabledForward = backNForwardViewModel.disabledForward;
      expect(disabledForward).toEqual(false);
    }
  }

  @testable
  class go {
    @test('should set cursor when execute go function')
    t1() {
      historyStack.push('/messages/text');
      historyStack.push('/messages/text1');

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
    }
  }
});
