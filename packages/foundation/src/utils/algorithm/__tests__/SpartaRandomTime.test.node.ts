/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-06-27 15:05:02
 * Copyright © RingCentral. All rights reserved.
 */

import { SPARTA_TIME_RANGE, getSpartaRandomTime } from '../SpartaRandomTime';

describe('getSpartaRandomTime', () => {
  it('should return 0 when count is 0 - 1', () => {
    expect(getSpartaRandomTime(0, false)).toEqual(0);
  });
  it('should return 0 when count is 0 - 2', () => {
    expect(getSpartaRandomTime(0, true)).toEqual(0);
  });
  it('should return value with second unit', () => {
    const result = getSpartaRandomTime(1, false);
    expect(
      result >= SPARTA_TIME_RANGE[0].low && result <= SPARTA_TIME_RANGE[0].high,
    ).toBeTruthy();
  });
  it('should return value with millisecond unit', () => {
    const result = getSpartaRandomTime(1, true);
    expect(
      result >= SPARTA_TIME_RANGE[0].low * 1000 &&
        result <= SPARTA_TIME_RANGE[0].high * 1000,
    ).toBeTruthy();
  });
  it('should return the correct value when count is inside length with second unit', () => {
    const result = getSpartaRandomTime(3, false);
    expect(
      result >= SPARTA_TIME_RANGE[2].low && result <= SPARTA_TIME_RANGE[2].high,
    ).toBeTruthy();
  });
  it('should return the correct value when count is inside length with millisecond unit', () => {
    const result = getSpartaRandomTime(5, true);
    expect(
      result >= SPARTA_TIME_RANGE[4].low * 1000 &&
        result <= SPARTA_TIME_RANGE[4].high * 1000,
    ).toBeTruthy();
  });
  it('should return the last one when count is over length - 1', () => {
    const result = getSpartaRandomTime(50, true);
    expect(
      result >= SPARTA_TIME_RANGE[SPARTA_TIME_RANGE.length - 1].low * 1000 &&
        result <= SPARTA_TIME_RANGE[SPARTA_TIME_RANGE.length - 1].high * 1000,
    ).toBeTruthy();
  });
  it('should return the last one when count is over length - 2', () => {
    const result = getSpartaRandomTime(50, false);
    expect(
      result >= SPARTA_TIME_RANGE[SPARTA_TIME_RANGE.length - 1].low &&
        result <= SPARTA_TIME_RANGE[SPARTA_TIME_RANGE.length - 1].high,
    ).toBeTruthy();
  });
});
