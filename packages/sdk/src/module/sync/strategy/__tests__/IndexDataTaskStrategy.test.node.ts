/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-05-07 11:06:26
 * Copyright © RingCentral. All rights reserved.
 */
import { IndexDataTaskStrategy } from '../IndexDataTaskStrategy';
import { JOB_KEY } from '../../../../framework/utils/jobSchedule';

describe('IndexDataTaskStrategy', () => {
  const strategy: IndexDataTaskStrategy = new IndexDataTaskStrategy();
  const RETRY_AFTER_STRATEGY: number[] = [
    3,
    5,
    10,
    60,
    3 * 60,
    5 * 60,
    10 * 60,
    30 * 60,
    60 * 60,
  ];
  function clearMocks() {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  }

  describe('getNext()', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should get last strategy if run times than strategy length', () => {
      for (let i = 0; i < 15; i++) {
        strategy.getNext();
      }
      const retryIndex = strategy['_retryIndex'];
      expect(RETRY_AFTER_STRATEGY[retryIndex]).toEqual(60 * 60);
    });

    it('should set retry index to -1 if call reset api', () => {
      for (let i = 0; i < 15; i++) {
        strategy.getNext();
      }
      const retryIndex1 = strategy['_retryIndex'];
      expect(retryIndex1).toEqual(RETRY_AFTER_STRATEGY.length - 1);
      strategy.reset();
      const retryIndex2 = strategy['_retryIndex'];
      expect(retryIndex2).toEqual(-1);
    });
  });

  describe('reset()', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should set retry index to -1 if call reset api', () => {
      for (let i = 0; i < 15; i++) {
        strategy.getNext();
      }
      const retryIndex1 = strategy['_retryIndex'];
      expect(retryIndex1).toEqual(RETRY_AFTER_STRATEGY.length - 1);
      strategy.reset();
      const retryIndex2 = strategy['_retryIndex'];
      expect(retryIndex2).toEqual(-1);
    });
  });

  describe('canNext()', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should always return true for the canNext api', () => {
      for (let i = 0; i < 15; i++) {
        strategy.getNext();
        const canNext = strategy.canNext();
        expect(canNext).toEqual(true);
      }
    });
  });

  describe('getTaskKey()', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should return INDEX_DATA for the task key', () => {
      const taskKey = strategy.getJobKey();
      expect(taskKey).toEqual(JOB_KEY.INDEX_DATA);
    });
  });
});
