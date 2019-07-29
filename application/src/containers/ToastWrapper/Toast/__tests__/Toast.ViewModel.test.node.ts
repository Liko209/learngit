/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-12-10 15:03:20
 * Copyright © RingCentral. All rights reserved.
 */
import { ToastViewModel } from '../Toast.ViewModel';
describe('Toast.ViewModel', () => {
  describe('constructor', () => {
    it('should successfully construct', () => {
      const vm = new ToastViewModel();
      expect(vm).toHaveProperty('props');
    });
  });
});
