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
import { RCInfoService } from 'sdk/module/rcInfo';
import { mockService } from 'shield/sdk';

jest.mock('@/utils/date');
jest.mock('i18next', () => ({
  languages: ['en'],
  services: {
    backendConnector: {
      state: {
        'en|translation': -1,
      },
    },
  },
  isInitialized: true,
  t: (text: string) => text,
}));

describe('CallLogItemViewModel', () => {
  @testable
  class data {
    @test('should be return call log data if get data')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({})
    t1() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.data).toEqual({});
    }
  }

  @testable
  class lastReadMissed {
    @test('should be return lastReadMissed if get lastReadMissed')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockSingleEntity('lastReadMissed')
    t1() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.lastReadMissed).toBe('lastReadMissed');
    }

    @test('should be return 0 if lastReadMissed is undefined')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockSingleEntity(undefined)
    t2() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.lastReadMissed).toBe(0);
    }
  }

  @testable
  class isUnread {
    @test(
      'should be true if missedcall call log timestamp > lastReadMissed [JPT-2174]',
    )
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      timestamp: 2,
      result: CALL_RESULT.MISSED,
    })
    @mockSingleEntity(1)
    t1() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.isUnread).toBeTruthy();
    }

    @test(
      'should be false if missedcall call log timestamp < lastReadMissed [JPT-2174]',
    )
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      timestamp: 1,
      result: CALL_RESULT.MISSED,
    })
    @mockSingleEntity(2)
    t2() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.isUnread).toBeFalsy();
    }
    @test('should be false if outbound call log timestamp > lastReadMissed')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      to: {},
      timestamp: 2,
      direction: CALL_DIRECTION.OUTBOUND,
    })
    @mockSingleEntity(1)
    t3() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.isUnread).toBeFalsy();
    }

    @test('should be false if inbound call log timestamp < lastReadMissed')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      from: {},
      timestamp: 1,
      direction: CALL_DIRECTION.INBOUND,
    })
    @mockSingleEntity(2)
    t4() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.isUnread).toBeFalsy();
    }
  }

  @testable
  class caller {
    @test('should be get from caller if inbound')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({ direction: CALL_DIRECTION.INBOUND, from: {} })
    t1() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.caller).toEqual({});
    }

    @test('should be get from caller if outbound')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({ direction: CALL_DIRECTION.OUTBOUND, to: {} })
    t2() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.caller).toEqual({});
    }
  }

  @testable
  class icon {
    @test('should be missedcall if isMissedCall = MISSED [JPT-2151]')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({ result: CALL_RESULT.MISSED })
    t1() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.icon).toBe('missedcall');
    }

    @test('should be missedcall if isMissedCall = VOICEMAIL [JPT-2151]')
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({ result: CALL_RESULT.VOICEMAIL })
    t2() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.icon).toBe('missedcall');
    }

    @test(
      'should be incall if isMissedCall = true && is inbound call [JPT-2151]',
    )
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
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
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
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
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({ result: CALL_RESULT.MISSED })
    t1() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      expect(vm.callType).toBe('telephony.result.missedcall');
    }

    @test(
      'should be return telephony.direction.inboundcall if is INBOUND call [JPT-2151]',
    )
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
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
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
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
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
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
    @mockService(RCInfoService, 'isRCFeaturePermissionEnabled', true)
    @mockEntity({
      startTime: 'startTime',
    })
    t1() {
      const vm = new CallLogItemViewModel({ id: 'id' });
      vm.startTime;
      expect(postTimestamp).toHaveBeenCalledWith('startTime');
    }
  }

  @testable
  class shouldShowCall {
    @test('should be true if has call permission [JPT-2384]')
    @mockService(RCInfoService, [
      {
        method: 'isRCFeaturePermissionEnabled',
        data: true,
      },
      {
        method: 'isVoipCallingAvailable',
        data: false,
      },
    ])
    @mockEntity({
      attachments: [],
    })
    async t1() {
      const vm = new CallLogItemViewModel({ id: 1 });
      expect(await vm.shouldShowCall()).toBeFalsy();
    }
  }
});
