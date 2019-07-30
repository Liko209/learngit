/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-13 15:40:43
 * Copyright © RingCentral. All rights reserved.
 */

import { LinkItemService } from '../LinkItemService';
import { LinkItemController } from '../../controller/LinkItemController';
describe('LinkItemService', () => {
  let linkItemService: LinkItemService;
  beforeEach(() => {
    linkItemService = new LinkItemService();
  });
  describe('linkItemController()', () => {
    it('should return controller when has _linkItemController', async () => {
      linkItemService['_linkItemController'] = {};
      const result = await linkItemService.linkItemController;
      expect(result).toEqual({});
    });

    it('should return new controller when has no _linkItemController', async () => {
      linkItemService['_linkItemController'] = undefined;
      const result = await linkItemService.linkItemController;
      expect(result instanceof LinkItemController).toBeTruthy();
    });
  });
});
