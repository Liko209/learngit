/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:17:12
 * Copyright © RingCentral. All rights reserved.
 */
import { JServerError } from '../JServerError';
import { ERROR_TYPES } from '../../types';

describe('JServerError', () => {
  describe('new JServerError()', () => {
    it('should create a JServerError', () => {
      const code = 'mock code';
      const message = 'mock msg';
      const error = new JServerError(code, message);
      expect(error.type).toEqual(ERROR_TYPES.SERVER);
      expect(error.code).toEqual(code);
      expect(error.message).toEqual(message);
      expect(error instanceof JServerError).toBeTruthy();
    });
  });
});
