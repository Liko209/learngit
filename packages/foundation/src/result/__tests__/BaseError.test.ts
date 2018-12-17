/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-26 11:04:13
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseError } from '../BaseError';

describe('BaseError', () => {
  describe('constructor()', () => {
    it('should be instanceof Error', () => {
      const error = new BaseError(1, 'Something wrong happened.');

      expect(error instanceof Error).toBe(true);
    });

    it('should have given error code and message', () => {
      const error = new BaseError(1, 'Something wrong happened.');

      expect(error.code).toBe(1);
      expect(error.message).toBe('Something wrong happened.');
    });
  });
});
