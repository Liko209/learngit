/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-29 16:11:31
 * Copyright © RingCentral. All rights reserved.
 */

import { InteractiveMessageItemService } from '../InteractiveMessageItemService';
describe('InteractiveMessageItemService', () => {
  describe('interactiveMessageItemController', () => {
    it('should not return null', () => {
      const service = new InteractiveMessageItemService();
      expect(service['_interactiveMessageItemController']).not.toBeNull();
    });
  });
});
