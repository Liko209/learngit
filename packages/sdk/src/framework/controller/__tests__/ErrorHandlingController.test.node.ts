/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-19 14:06:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ErrorHandlingController } from '../impl/ErrorHandlingController';

describe('RequestController', () => {
  let controller: ErrorHandlingController;

  beforeEach(() => {
    controller = new ErrorHandlingController();
  });

  describe('throwUndefinedError()', () => {
    it('should throw exception', async () => {
      expect(controller.throwUndefinedError).toThrow();
    });
  });

  describe('throwInvalidParameterError()', () => {
    it('should throw exception', async () => {
      expect(controller.throwInvalidParameterError).toThrow();
    });
  });
});
