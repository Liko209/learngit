/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-20 09:20:46
 * Copyright © RingCentral. All rights reserved.
 */

import { EventUtils } from '../EventUtils';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('EventUtils', () => {
  beforeEach(() => {
    clearMocks();
  });

  describe('getEffectiveEnd', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should return item self effective end when item is not changed', () => {
      const event: any = {
        id: 8,
        created_at: 111,
        modified_at: 111,
        effective_end: 999,
      };

      expect(EventUtils.getEffectiveEnd(event)).toEqual(event.effective_end);
    });

    function setEvent(option: {
      start: number;
      end: number;
      effective_end: number;
      repeat: string;
      repeat_ending: string;
      repeat_ending_after: string | null;
      repeat_ending_on: number | null;
      all_day: boolean;
    }) {
      return {
        ...option,
        id: 2301966,
        created_at: 1,
        modified_at: 2,
        group_ids: [264814594],
        description: 'des',
      };
    }

    it.each`
      start            | end              | effective_end    | repeat         | repeat_ending | repeat_ending_after | repeat_ending_on | all_day  | expected
      ${123}           | ${124}           | ${345}           | ${'none'}      | ${'none'}     | ${'1'}              | ${null}          | ${false} | ${124}
      ${123}           | ${124}           | ${345}           | ${'none'}      | ${'none'}     | ${'1'}              | ${null}          | ${false} | ${124}
      ${1553007600000} | ${1553009400000} | ${345}           | ${'daily'}     | ${'after'}    | ${'2'}              | ${null}          | ${false} | ${1553180400000}
      ${1552924800000} | ${1552926600000} | ${345}           | ${'weekdaily'} | ${'after'}    | ${'2'}              | ${null}          | ${false} | ${1553270400000}
      ${1553050800000} | ${1553052600000} | ${1553184000000} | ${'daily'}     | ${'on'}       | ${'1'}              | ${1553184000000} | ${false} | ${1553184000000}
      ${1553050800000} | ${1553052600000} | ${345}           | ${'daily'}     | ${'none'}     | ${'1'}              | ${null}          | ${false} | ${Number.MAX_SAFE_INTEGER}
    `(
      'should get right end time: $expected',
      ({
        start,
        end,
        effective_end,
        repeat,
        repeat_ending,
        repeat_ending_after,
        repeat_ending_on,
        all_day,
        expected,
      }) => {
        const event: any = setEvent({
          start,
          end,
          effective_end,
          repeat,
          repeat_ending,
          repeat_ending_after,
          repeat_ending_on,
          all_day,
        });

        expect(EventUtils.getEffectiveEnd(event)).toEqual(expected);
      },
    );
  });
});
