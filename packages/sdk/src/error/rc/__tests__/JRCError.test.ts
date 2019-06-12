/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:17:12
 * Copyright © RingCentral. All rights reserved.
 */
import { JRCError } from '../JRCError';
import { ERROR_TYPES } from '../../types';

describe('JRCError', () => {
  describe('new JRCError()', () => {
    it('should create a JRCError', () => {
      const code = 'mock code';
      const message = 'mock msg';
      const error = new JRCError(code, message);
      expect(error.type).toEqual(ERROR_TYPES.RC);
      expect(error.code).toEqual(code);
      expect(error.message).toEqual(message);
      expect(error instanceof JRCError).toBeTruthy();
    });
  });
});
