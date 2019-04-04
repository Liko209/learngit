/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-02-28 13:17:56
 * Copyright © RingCentral. All rights reserved.
 */
import PreFetchPostProcessor from '../PreFetchPostProcessor';

describe('PreFetchPostProcessor', () => {
  let preFetchPostProcessor: PreFetchPostProcessor;
  const groupId = 2;
  let preFetchFunc: (groupId: number) => Promise<void>;

  function clearAllMocks() {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  }
  function setUp() {
    preFetchFunc = jest.fn();
    preFetchPostProcessor = new PreFetchPostProcessor(groupId, preFetchFunc);
  }
  beforeEach(() => {
    clearAllMocks();
    setUp();
  });

  describe('process()', () => {
    beforeEach(() => {
      clearAllMocks();
      setUp();
    });

    it('should pass group and execute process function', async () => {
      await preFetchPostProcessor.process();
      expect(preFetchFunc).toBeCalledWith(groupId);
    });

    it('should not throw error even if pre fetch function throw an error  ', async () => {
      preFetchFunc = jest.fn().mockRejectedValue('err');
      expect(preFetchPostProcessor.process()).resolves.not.toThrow();
    });
  });

  describe('canContinue()', () => {
    beforeEach(() => {
      clearAllMocks();
      setUp();
    });

    it('should return true', () => {
      const result = preFetchPostProcessor.canContinue();
      expect(result).toBeTruthy();
    });
  });

  describe('name()', () => {
    beforeEach(() => {
      clearAllMocks();
      setUp();
    });

    it('should return groupId as name', () => {
      const result = preFetchPostProcessor.name();
      expect(result).toBe('2');
    });
  });
});
