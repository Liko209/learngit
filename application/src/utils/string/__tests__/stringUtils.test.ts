/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-24 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { trimStringBothSides, matchEmail } from '../index';

describe('trimStringBothSides()', () => {
  it('should spaces at the beginning or end should be ignored [JPT-2661]', () => {
    expect(trimStringBothSides(' 123 4   ')).toBe('123 4');
  });
});

describe('matchEmail()', () => {
  it('should return true when email validation correct', () => {
    expect(matchEmail('1@qq.com')).toBe(true);
  });
  it('should return false when email validation incorrect', () => {
    expect(matchEmail('@qq.')).toBe(false);
  });
});
