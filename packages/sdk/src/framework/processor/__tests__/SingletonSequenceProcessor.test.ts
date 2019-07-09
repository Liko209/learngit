/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-07-01 13:08:56
 * Copyright © RingCentral. All rights reserved.
 */

import { SingletonSequenceProcessor } from '../SingletonSequenceProcessor';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SingletonSequenceProcessor', () => {
  beforeEach(() => {
    clearMocks();
  });

  describe('getSequenceProcessorHandler', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should return correct parameter of the processor', () => {
      const option = { name: 'MySequenceProcessorHandler', maxSize: 2 };
      const sequenceProcessorHandler = SingletonSequenceProcessor.getSequenceProcessorHandler(
        option,
      );
      expect(sequenceProcessorHandler.option).toEqual(option);
    });
  });
});
