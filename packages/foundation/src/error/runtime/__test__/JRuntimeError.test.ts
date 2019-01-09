/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:17:12
 * Copyright © RingCentral. All rights reserved.
 */
import { JRuntimeError } from '../JRuntimeError';
import { ERROR_TYPES } from '../../types';

describe('JRuntimeError', () => {
  describe('new JRuntimeError()', () => {
    it('should create a JRuntimeError', () => {
      const code = 'mock code';
      const message = 'mock msg';
      const error = new JRuntimeError(code, message);
      expect(error.type).toEqual(ERROR_TYPES.RUNTIME);
      expect(error.code).toEqual(code);
      expect(error.message).toEqual(message);
      expect(error instanceof JRuntimeError).toBeTruthy();
    });
  });
});
