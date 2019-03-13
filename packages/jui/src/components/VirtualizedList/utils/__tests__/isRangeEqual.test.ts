/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 18:55:52
 * Copyright © RingCentral. All rights reserved.
 */
import { isRangeEqual } from '../isRangeEqual';

describe('isRangeEqual()', () => {
  it('should be true', () => {
    expect(
      isRangeEqual(
        { startIndex: 0, stopIndex: 10 },
        { startIndex: 0, stopIndex: 10 },
      ),
    ).toBeTruthy();
  });

  it('should be false', () => {
    expect(
      isRangeEqual(
        { startIndex: 0, stopIndex: 10 },
        { startIndex: 0, stopIndex: 9 },
      ),
    ).toBeFalsy();
  });
});
