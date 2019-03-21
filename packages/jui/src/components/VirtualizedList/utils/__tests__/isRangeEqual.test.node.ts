/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 18:55:52
 * Copyright © RingCentral. All rights reserved.
 */
import { isRangeEqual } from '../isRangeEqual';

describe('isRangeEqual()', () => {
  it.each`
    range1     | range2     | expected
    ${[0, 10]} | ${[0, 10]} | ${true}
    ${[0, 0]}  | ${[0, 0]}  | ${true}
    ${[-1, 0]} | ${[-1, 0]} | ${true}
    ${[0, 10]} | ${[0, 9]}  | ${false}
    ${[0, 10]} | ${[1, 10]} | ${false}
  `(
    'should return $expected for $range1 equals $range2',
    ({ range1, range2, expected }) => {
      expect(
        isRangeEqual(
          {
            startIndex: range1[0],
            stopIndex: range1[1],
          },
          {
            startIndex: range2[0],
            stopIndex: range2[1],
          },
        ),
      ).toBe(expected);
    },
  );
});
