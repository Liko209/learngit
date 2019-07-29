/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:17:12
 * Copyright © RingCentral. All rights reserved.
 */
import { JError } from '../JError';
import { stringMatch, errorConditionSelector } from '../utils';

describe('types', () => {
  describe('stringMatch()', () => {
    it('should match when target === str', () => {
      expect(stringMatch('a', 'a')).toBeTruthy();
    });
    it('should match when target !== str', () => {
      expect(stringMatch('a', 'ab')).toBeFalsy();
    });
  });
  describe('errorConditionSelector()', () => {
    it('should match error while type match && one of codes is match', () => {
      const error = new JError('a', 'b', 'some error');
      expect(
        errorConditionSelector(error, {
          type: 'a',
          codes: ['b'],
        }),
      ).toBeTruthy();
      expect(
        errorConditionSelector(error, {
          type: 'a',
          codes: ['b', 'c'],
        }),
      ).toBeTruthy();
      expect(
        errorConditionSelector(error, {
          type: 'a',
          codes: ['a', 'b', 'c'],
        }),
      ).toBeTruthy();
    });

    it('should not match error while one of type, code is not match', () => {
      const error = new JError('a', 'b', 'some error');
      expect(
        errorConditionSelector(error, {
          type: 'a',
          codes: ['c'],
        }),
      ).toBeFalsy();
      expect(
        errorConditionSelector(error, {
          type: 'b',
          codes: ['b'],
        }),
      ).toBeFalsy();
      expect(
        errorConditionSelector(error, {
          type: 'a',
          codes: ['c', 'd'],
        }),
      ).toBeFalsy();
    });

    it('should not match error while excludeCodes match', () => {
      const error = new JError('a', 'b', 'some error');
      expect(
        errorConditionSelector(error, {
          type: 'a',
          codes: ['*'],
          excludeCodes: [],
        }),
      ).toBeTruthy();
      expect(
        errorConditionSelector(error, {
          type: 'a',
          codes: ['*'],
          excludeCodes: ['b'],
        }),
      ).toBeFalsy();
    });
  });
});
