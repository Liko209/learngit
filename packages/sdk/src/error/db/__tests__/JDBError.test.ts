/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:17:12
 * Copyright © RingCentral. All rights reserved.
 */
import { JDBError } from '../JDBError';
import { ERROR_TYPES } from '../../types';

describe('JDBError', () => {
  describe('new JDBError()', () => {
    it('should create a JDBError', () => {
      const code = 'mock code';
      const message = 'mock msg';
      const error = new JDBError(code, message);
      expect(error.type).toEqual(ERROR_TYPES.DB);
      expect(error.code).toEqual(code);
      expect(error.message).toEqual(message);
      expect(error instanceof JDBError).toBeTruthy();
    });
  });
});
