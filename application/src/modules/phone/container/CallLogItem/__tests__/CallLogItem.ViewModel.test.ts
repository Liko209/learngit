/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-09 19:31:43
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockEntity, mockSingleEntity } from 'shield/application';
import { CALL_DIRECTION } from 'sdk/module/RCItems';
import { CALL_RESULT } from 'sdk/module/RCItems/callLog/constants';
import { getHourMinuteSeconds, postTimestamp } from '@/utils/date';

import { CallLogItemViewModel } from '../CallLogItem.ViewModel';

jest.mock('@/utils/date');

describe('CallLogItemViewModel', () => {
  @testable
  class data {
    @test('should be return call log data if get data')
    @mockEntity({})
    t1() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.data).toEqual({});
    }
  }

  @testable
  class lastReadMissed {
    @test('should be return lastReadMissed if get lastReadMissed')
    @mockSingleEntity('lastReadMissed')
    t1() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.lastReadMissed).toBe('lastReadMissed');
    }

    @test('should be return 0 if lastReadMissed is undefined')
    @mockSingleEntity(undefined)
    t2() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.lastReadMissed).toBe(0);
    }
  }

  @testable
  class isUnread {
    @test('should be true if call log id > lastReadMissed')
    @mockEntity({ id: 2 })
    @mockSingleEntity(1)
    t1() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.isUnread).toBeTruthy();
    }

    @test('should be false if call log id < lastReadMissed')
    @mockEntity({ id: 1 })
    @mockSingleEntity(2)
    t2() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.isUnread).toBeFalsy();
    }
  }

  @testable
  class caller {
    @test('should be get from caller if inbound')
    @mockEntity({ direction: CALL_DIRECTION.INBOUND, from: {} })
    t1() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.caller).toEqual({});
    }

    @test('should be get from caller if outbound')
    @mockEntity({ direction: CALL_DIRECTION.OUTBOUND, to: {} })
    t2() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.caller).toEqual({});
    }
  }

  @testable
  class icon {
    @test('should be missedcall if isMissedCall = MISSED [JPT-2151]')
    @mockEntity({ result: CALL_RESULT.MISSED })
    t1() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.icon).toBe('missedcall');
    }

    @test('should be missedcall if isMissedCall = VOICEMAIL [JPT-2151]')
    @mockEntity({ result: CALL_RESULT.VOICEMAIL })
    t2() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.icon).toBe('missedcall');
    }

    @test(
      'should be incall if isMissedCall = true && is inbound call [JPT-2151]',
    )
    @mockEntity({
      result: CALL_RESULT.ABANDONED,
      direction: CALL_DIRECTION.INBOUND,
    })
    t3() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.icon).toBe('incall');
    }

    @test(
      'should be outcall if isMissedCall = true && is outbound call [JPT-2151]',
    )
    @mockEntity({
      result: CALL_RESULT.ABANDONED,
      direction: CALL_DIRECTION.OUTBOUND,
    })
    t4() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.icon).toBe('outcall');
    }
  }

  @testable
  class callType {
    @test(
      'should be return telephony.result.missedcall if is missed call [JPT-2151]',
    )
    @mockEntity({ result: CALL_RESULT.MISSED })
    t1() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.callType).toBe('telephony.result.missedcall');
    }

    @test(
      'should be return telephony.direction.inboundcall if is INBOUND call [JPT-2151]',
    )
    @mockEntity({
      result: CALL_RESULT.ABANDONED,
      direction: CALL_DIRECTION.INBOUND,
    })
    t2() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.callType).toBe('telephony.direction.inboundcall');
    }

    @test(
      'should be return telephony.direction.inboundcall if is OUTBOUND call [JPT-2151]',
    )
    @mockEntity({
      result: CALL_RESULT.ABANDONED,
      direction: CALL_DIRECTION.OUTBOUND,
    })
    t3() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.callType).toBe('telephony.direction.outboundcall');
    }
  }

  @testable
  class duration {
    @test('should be call getHourMinuteSeconds if get duration')
    @mockEntity({
      duration: 'duration',
    })
    t1() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      getHourMinuteSeconds.mockImplementation(() => ({
        secondTime: 1,
        hourTime: 1,
        minuteTime: 1,
      }));
      vm.duration;
      expect(getHourMinuteSeconds).toHaveBeenCalledWith('duration');
    }
  }

  @testable
  class startTime {
    @test('should be call postTimestamp if get startTime [JPT-2144]')
    @mockEntity({
      startTime: 'startTime',
    })
    t1() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      vm.startTime;
      expect(postTimestamp).toHaveBeenCalledWith('startTime');
    }
  }
});
