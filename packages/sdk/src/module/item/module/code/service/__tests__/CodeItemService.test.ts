/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-13 15:40:43
 * Copyright © RingCentral. All rights reserved.
 */

import { CodeItemService } from '../CodeItemService';

describe('CodeItemService', () => {
  let codeItemService: CodeItemService;
  beforeEach(() => {
    codeItemService = new CodeItemService();
  });
  describe('getSortedIds()', () => {
    it('should return []', async () => {
      const result = await codeItemService.getSortedIds();
      expect(result).toEqual([]);
    });
  });

  describe('getSubItemsCount()', () => {
    it('should return 0', async () => {
      const result = await codeItemService.getSubItemsCount();
      expect(result).toEqual(0);
    });
  });
});
