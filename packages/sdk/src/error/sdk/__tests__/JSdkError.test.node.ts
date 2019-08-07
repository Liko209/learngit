/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:17:12
 * Copyright © RingCentral. All rights reserved.
 */
import { JSdkError } from '../JSdkError';
import { ERROR_TYPES } from '../../types';

describe('JSdkError', () => {
  describe('new JSdkError()', () => {
    it('should create a JSdkError', () => {
      const code = 'mock code';
      const message = 'mock msg';
      const error = new JSdkError(code, message);
      expect(error.type).toEqual(ERROR_TYPES.SDK);
      expect(error.code).toEqual(code);
      expect(error.message).toEqual(message);
      expect(error instanceof JSdkError).toBeTruthy();
    });
  });
});
