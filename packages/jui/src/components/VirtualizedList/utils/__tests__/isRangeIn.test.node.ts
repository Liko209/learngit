/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 18:55:52
 * Copyright © RingCentral. All rights reserved.
 */
import { isRangeIn } from '../isRangeIn';

describe('isRangeIn()', () => {
  it.each`
    range1     | range2      | expected
    ${[0, 10]} | ${[1, 1]}   | ${true}
    ${[0, 10]} | ${[0, 10]}  | ${true}
    ${[0, 10]} | ${[0, 11]}  | ${false}
    ${[0, 10]} | ${[-1, 10]} | ${false}
    ${[0, 10]} | ${[-1, 11]} | ${false}
  `(
    '$range2 in $range1 should be $expected',
    ({ range1, range2, expected }) => {
      expect(
        isRangeIn(
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
