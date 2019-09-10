/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { trimStringBothSides, matchUrl } from '../index';

describe('trimStringBothSides()', () => {
  it('should spaces at the beginning or end should be ignored [JPT-2661]', () => {
    expect(trimStringBothSides(' 123 4   ')).toBe('123 4');
  });
});

describe('matchUrl()', () => {
  it('should return true when email validation correct', () => {
    expect(matchUrl('http://1.com')).toBe(true);
  });
  it('should return false when email validation incorrect', () => {
    expect(matchUrl('qq.com')).toBe(false);
  });
});
