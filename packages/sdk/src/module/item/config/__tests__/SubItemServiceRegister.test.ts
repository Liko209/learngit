/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-13 14:54:14
 * Copyright © RingCentral. All rights reserved.
 */

import { SubItemServiceRegister } from '../SubItemServiceRegister';
describe('SubItemServiceRegister', () => {
  describe('buildSubItemServices()', () => {
    it('should return a map and size is 7 ', () => {
      const result = SubItemServiceRegister.buildSubItemServices();
      expect(result instanceof Map).toBeTruthy();
      expect(result.size).toBe(7);
    });
  });
});
