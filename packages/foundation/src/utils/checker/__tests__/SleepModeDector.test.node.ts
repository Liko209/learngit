/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-06 11:12:06
 * Copyright © RingCentral. All rights reserved.
 */
import { SleepModeDetector } from '../SleepModeDetector';

describe('SleepModeDetector', () => {
  describe('constructor', () => {
    it('should be null of _heartBeatCheck', () => {
      const sl = new SleepModeDetector();
      expect(sl['_heartBeatCheck']).toBeUndefined();
    });
  });
  describe('subScribe-unSubscribe', () => {
    it('should subscribe success when key is not existed', () => {
      const sl = new SleepModeDetector();
      const result = sl.subScribe('aa', () => {});
      expect(result).toBeTruthy();
      sl.cleanUp();
    });
    it('should subscribe fail when key is existed', () => {
      const sl = new SleepModeDetector();
      sl.subScribe('aa', () => {});
      const result = sl.subScribe('aa', () => {});
      expect(result).toBeFalsy();
      sl.cleanUp();
    });

    it('should release the callback if unsubscribe', () => {
      const sl = new SleepModeDetector();
      sl.subScribe('aa', () => {});
      let map = sl['_callbacksMap'];
      expect(map.has('aa')).toBeTruthy();
      sl.unSubscribe('aa');
      map = sl['_callbacksMap'];
      expect(map.has('aa')).toBeFalsy();
      sl.cleanUp();
    });
  });

  describe('cleanUp', () => {
    it('should clear data', () => {
      const sl = new SleepModeDetector();
      sl.subScribe('aa', () => {});
      sl.cleanUp();

      const map = sl['_callbacksMap'];
      expect(map.size).toEqual(0);
      expect(sl['_heartBeatCheck']).toBeUndefined();
    });
  });
});
