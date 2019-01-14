/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-14 10:41:04
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../../module/base/entity';
import { FileItem } from '../../module/file/entity';

import { ItemFilterUtils } from '../ItemFilterUtils';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('ItemFilterUtils', () => {
  beforeEach(() => {
    clearMocks();
  });

  describe('isValidItem', () => {
    const item1 = {
      id: 10,
      group_ids: [11, 222, 33],
    } as Item;

    it('should return true when item is valid', () => {
      expect(ItemFilterUtils.isValidItem(11, item1)).toBeTruthy();
    });

    it('should return false when item group id is not exist in the post', () => {
      expect(ItemFilterUtils.isValidItem(88, item1)).toBeFalsy();
    });
  });

  describe('fileFilter', () => {
    const item1 = {
      id: 10,
      group_ids: [11, 222, 33],
      type: 'jpg',
    } as FileItem;

    const item2 = {
      id: 10,
      group_ids: [11, 222, 33],
      type: 'doc',
    } as FileItem;

    it('should return true when item is image type', () => {
      expect(ItemFilterUtils.fileFilter(11, true)(item1)).toBeTruthy();
    });

    it('should return false when item is not image', () => {
      expect(ItemFilterUtils.fileFilter(11, true)(item2)).toBeFalsy();
    });

    it('should return false when item is not file', () => {
      item1.id = 111;
      expect(ItemFilterUtils.fileFilter(11, true)(item1)).toBeFalsy();
    });
  });
});
