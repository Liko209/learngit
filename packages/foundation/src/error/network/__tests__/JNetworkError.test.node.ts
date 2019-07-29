/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:17:12
 * Copyright © RingCentral. All rights reserved.
 */
import { JNetworkError } from '../JNetworkError';
import { ERROR_TYPES } from '../../types';

describe('JNetworkError', () => {
  describe('new JNetworkError()', () => {
    it('should create a JNetworkError', () => {
      const code = 'mock code';
      const message = 'mock msg';
      const error = new JNetworkError(code, message);
      expect(error.type).toEqual(ERROR_TYPES.NETWORK);
      expect(error.code).toEqual(code);
      expect(error.message).toEqual(message);
      expect(error instanceof JNetworkError).toBeTruthy();
    });
  });
});
