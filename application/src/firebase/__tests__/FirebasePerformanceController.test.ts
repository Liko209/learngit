/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-07-03 16:23:43
 * Copyright © RingCentral. All rights reserved.
 */

import { FirebasePerformanceController } from '../FirebasePerformanceController';
import { FirebasePerformance } from '../../../../packages/foundation/src';

jest.mock('@/config', () => ({
  isProductionAccount: jest.fn(() => {
    return true;
  }),
}));

describe('FirebasePerformanceController', () => {
  describe('initialize', () => {
    it('should initialize firebase performance for production account', () => {
      const firebasePerformance = FirebasePerformance.getInstance();
      const spy = jest.spyOn(firebasePerformance, 'initialize');
      const firebase = new FirebasePerformanceController();
      firebase.initialize();
      expect(spy).toBeCalled();
    });
  });
});
