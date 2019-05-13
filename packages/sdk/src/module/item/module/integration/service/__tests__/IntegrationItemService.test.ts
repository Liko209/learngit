/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-29 16:11:31
 * Copyright © RingCentral. All rights reserved.
 */

import { IntegrationItemService } from '../IntegrationItemService';
describe('IntegrationItemService', () => {
  describe('integrationItemController', () => {
    it('should not return null', () => {
      const service = new IntegrationItemService();
      expect(service['_integrationItemController']).not.toBeNull();
    });
  });
});
