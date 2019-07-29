/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:17:12
 * Copyright © RingCentral. All rights reserved.
 */
import { JError } from '../JError';

describe('JError', () => {
  describe('new JError()', () => {
    it('should create a JError', () => {
      const type = 'mock type';
      const code = 'mock code';
      const message = 'mock msg';
      const error = new JError(type, code, message);
      expect(error.type).toEqual(type);
      expect(error.code).toEqual(code);
      expect(error.message).toEqual(message);
      expect(error instanceof JError).toBeTruthy();
    });
  });
});
