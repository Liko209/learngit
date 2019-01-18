/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-17 17:49:22
 * Copyright © RingCentral. All rights reserved.
 */

import { TTimeUtils } from '../TTimeUtils';

describe('TTimeUtils', () => {
  describe('compareDate', () => {
    it.each`
      lTime            | rTime            | res      | comments
      ${1552816248000} | ${1552902648000} | ${false} | ${'lhs < rhs more then a day'}
      ${1550397048000} | ${1550397048111} | ${true}  | ${'lhs < rhs less then a day'}
      ${1552902648000} | ${1552816248000} | ${true}  | ${'lhs > rhs more then a day'}
      ${1550397048111} | ${1550397048000} | ${true}  | ${'lhs > rhs less then a day'}
      ${1550397048000} | ${1550397048000} | ${true}  | ${'lhs === rhs'}
    `('should return expect res: $comments', ({ lTime, rTime, res }) => {
      expect(TTimeUtils.compareDate(lTime, rTime)).toEqual(res);
    });
  });
});
