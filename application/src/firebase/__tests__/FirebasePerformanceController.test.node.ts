/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-07-03 21:02:53
 * Copyright © RingCentral. All rights reserved.
 */
import { FirebasePerformanceController } from '../FirebasePerformanceController';
import {
  FirebasePerformance,
  KVStorageManager,
} from '../../../../packages/foundation/src';
import config from '@/config';

jest.mock('@/config', () => ({
  isProductionAccount: jest.fn(() => true),
}));

describe('FirebasePerformanceController', () => {
  const firebasePerformance = FirebasePerformance.getInstance();
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    firebasePerformance.initialize = jest.fn();
    window.indexedDB = {};
  });

  describe('initialize', () => {
    it('should initialize firebase performance for production account', () => {
      jest.spyOn(config, 'isProductionAccount').mockReturnValue(true);
      const firebase = new FirebasePerformanceController();
      firebase.initialize();
      expect(firebasePerformance.initialize).toHaveBeenCalled();
    });

    it('should not initialize firebase performance for non-production account', () => {
      jest.spyOn(config, 'isProductionAccount').mockReturnValue(false);
      const firebase = new FirebasePerformanceController();
      firebase.initialize();
      expect(firebasePerformance.initialize).not.toHaveBeenCalled();
    });

    it('should not initialize firebase performance when browser is not support storage', () => {
      KVStorageManager.prototype.isLocalStorageSupported = jest
        .fn()
        .mockReturnValue(false);
      jest.spyOn(config, 'isProductionAccount').mockReturnValue(false);
      const firebase = new FirebasePerformanceController();
      firebase.initialize();
      expect(firebasePerformance.initialize).not.toHaveBeenCalled();
    });
  });
});
