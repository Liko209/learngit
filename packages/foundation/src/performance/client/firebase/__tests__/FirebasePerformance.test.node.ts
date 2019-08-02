/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-07-03 21:02:53
 * Copyright © RingCentral. All rights reserved.
 */
import { FirebasePerformance } from '../FirebasePerformance';
import { KVStorageManager } from '../../../../db';

describe('FirebasePerformance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    window.indexedDB = {};
  });

  describe('initialize', () => {
    it('should initialize firebase when browser support storage', async () => {
      const firebasePerformance = new FirebasePerformance();

      const spyOn = jest.spyOn(firebasePerformance, 'initializeFirebase');
      await firebasePerformance.initialize();
      expect(spyOn).toHaveBeenCalled();
    });

    it('should not initialize firebase performance when browser is not support storage', async () => {
      KVStorageManager.prototype.isLocalStorageSupported = jest
        .fn()
        .mockReturnValue(false);
      const firebasePerformance = new FirebasePerformance();
      const spyOn = jest.spyOn(firebasePerformance, 'initializeFirebase');
      firebasePerformance.initialize();
      expect(spyOn).not.toHaveBeenCalled();
    });
  });

  describe('attributes', () => {
    it('should put/remove/get attribute correctly ', async () => {
      const firebasePerformance = new FirebasePerformance();
      firebasePerformance.putAttribute('test1', 'a');
      const result = firebasePerformance.getAttribute('test1');
      expect(result!.attr).toBe('test1');
      expect(result!.value).toBe('a');

      firebasePerformance.removeAttribute('test1');
      const result2 = firebasePerformance.getAttribute('test1');
      expect(result2).toBeUndefined();
    });
  });
});
