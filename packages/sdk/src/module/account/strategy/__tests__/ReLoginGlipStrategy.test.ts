/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-07-02 01:37:18
 * Copyright © RingCentral. All rights reserved.
 */

import { ReLoginGlipStrategy } from '../ReLoginGlipStrategy';
import { JOB_KEY } from 'sdk/framework/utils/jobSchedule';

describe('ReLoginGlipStrategy', () => {
  let strategy: ReLoginGlipStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    strategy = new ReLoginGlipStrategy();
  });

  describe('getNext', () => {
    it('should return correct value', () => {
      strategy['_retryIndex'] = 3;
      let value = strategy.getNext();
      expect(value).toBeGreaterThanOrEqual(8);
      expect(value).toBeLessThanOrEqual(16);

      strategy['_retryIndex'] = 32;
      value = strategy.getNext();
      expect(value).toBeGreaterThanOrEqual(2048);
      expect(value).toBeLessThanOrEqual(3600);
    });
  });

  describe('canNext', () => {
    it('should return true', () => {
      expect(strategy.canNext()).toBeTruthy();
    });
  });

  describe('reset', () => {
    it('should reset index', () => {
      strategy['_retryIndex'] = 8;
      strategy.reset();
      expect(strategy['_retryIndex']).toEqual(1);
    });
  });

  describe('getJobKey', () => {
    it('should return correct key', () => {
      expect(strategy.getJobKey()).toEqual(JOB_KEY.GLIP_LOGIN);
    });
  });
});
