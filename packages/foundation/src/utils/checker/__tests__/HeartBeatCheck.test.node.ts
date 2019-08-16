/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-03-15 18:57:32
 * Copyright © RingCentral. All rights reserved.
 */

import { HeartBeatCheck } from '../HeartBeatCheck';
import { getCurrentTime } from '../../jsUtils/jsUtils';

jest.mock('../../jsUtils/jsUtils');

describe('HeartBeatCheck', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.clearAllTimers();
  });
  describe('constructor', () => {
    it('should not do callback when heat beat is normal', () => {
      let called = false;
      const heartBeatCheck = new HeartBeatCheck(1, 5, () => {
        called = true;
      });
      expect(setInterval).toHaveBeenCalled();
      expect(called).toBeFalsy();
      heartBeatCheck.cleanUp();
    });
  });
  describe('cleanup', () => {
    it('should clean up all data', () => {
      const heart = new HeartBeatCheck(1, 5, () => {});
      heart.cleanUp();
      expect(heart._lastTick).toEqual(0);
      expect(heart._activityCheck).toBeUndefined();
    });
  });
});
