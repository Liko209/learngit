/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-05-10 16:48:10
 * Copyright © RingCentral. All rights reserved.
 */
import { PerformanceTracer } from '../PerformanceTracer';
import { PerformanceInfo } from '../types';

describe('PerformanceTracer', () => {
  let performanceTracer: PerformanceTracer;
  function clearMocks() {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  }

  describe('start()', () => {
    beforeEach(() => {
      performanceTracer = PerformanceTracer.initial();
      clearMocks();
    });
    it('should add start time to time line', () => {
      const updateTimeLineSpy = jest.spyOn(
        performanceTracer,
        '_updateTimeLine',
      );
      performanceTracer.start();
      expect(updateTimeLineSpy).toBeCalled();
    });
  });

  describe('trace()', () => {
    beforeEach(() => {
      performanceTracer = PerformanceTracer.initial();
      clearMocks();
    });
    it('should trace performance info', () => {
      const updateTimeLineSpy = jest.spyOn(
        performanceTracer,
        '_updateTimeLine',
      );
      performanceTracer.start();
      const info: PerformanceInfo = { key: 'test', count: 3 };
      performanceTracer.trace(info);
      const performanceInfos = performanceTracer['_performanceInfos'];
      expect(updateTimeLineSpy).toBeCalled();
      expect(performanceInfos.length).toBe(1);
      expect(performanceInfos[0].key).toEqual(info.key);
      expect(performanceInfos[0].count).toEqual(info.count);
    });
  });

  describe('end()', () => {
    beforeEach(() => {
      performanceTracer = PerformanceTracer.initial();
      clearMocks();
    });
    it('should trace performance info', () => {
      const updateTimeLineSpy = jest.spyOn(
        performanceTracer,
        '_updateTimeLine',
      );
      performanceTracer.start();
      const info1: PerformanceInfo = { key: 'test1', count: 3 };
      const info2: PerformanceInfo = { key: 'test2', count: 20 };
      performanceTracer.trace(info1);
      performanceTracer.end(info2);
      const performanceInfos = performanceTracer['_performanceInfos'];
      expect(updateTimeLineSpy).toBeCalled();
      expect(performanceInfos.length).toBe(2);
      expect(performanceInfos[1].key).toEqual(info1.key);
      expect(performanceInfos[1].count).toEqual(info1.count);
      expect(performanceInfos[0].key).toEqual(info2.key);
      expect(performanceInfos[0].count).toEqual(info2.count);
    });
  });
});
