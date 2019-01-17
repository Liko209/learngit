/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-14 10:41:04
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../../module/base/entity';
import { FileItem } from '../../module/file/entity';

import { ItemUtils } from '../ItemUtils';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('ItemUtils', () => {
  beforeEach(() => {
    clearMocks();
  });

  describe('isImageItem()', () => {
    it('should return true when is image', () => {
      const item1 = {
        id: 10,
        group_ids: [11, 222, 33],
        type: 'JPG',
      } as FileItem;
      expect(ItemUtils.isImageItem(item1)).toBeTruthy();
    });

    it('should return true when type has image', () => {
      const item1 = {
        id: 10,
        group_ids: [11, 222, 33],
        type: 'IMAGE/jpeg',
      } as FileItem;
      expect(ItemUtils.isImageItem(item1)).toBeTruthy();
    });

    it('should return true when type is giphy', () => {
      const item1 = {
        id: 10,
        group_ids: [11, 222, 33],
        type: 'giphy',
      } as FileItem;
      expect(ItemUtils.isImageItem(item1)).toBeTruthy();
    });

    it('should return false when is image', () => {
      const item1 = {
        id: 10,
        group_ids: [11, 222, 33],
        type: 'ppp',
      } as FileItem;
      expect(ItemUtils.isImageItem(item1)).toBeFalsy();
    });
  });
  describe('isValidItem', () => {
    const item1 = {
      id: 10,
      group_ids: [11, 222, 33],
    } as Item;

    it('should return true when item is valid', () => {
      expect(ItemUtils.isValidItem(11, item1)).toBeTruthy();
    });

    it('should return false when item group id is not exist in the post', () => {
      expect(ItemUtils.isValidItem(88, item1)).toBeFalsy();
    });
  });

  describe('fileFilter', () => {
    const item1 = {
      id: 10,
      group_ids: [11, 222, 33],
      type: 'JPG',
    } as FileItem;

    const item2 = {
      id: 10,
      group_ids: [11, 222, 33],
      type: 'doc',
    } as FileItem;

    it('should return true when item is image type', () => {
      expect(ItemUtils.fileFilter(11, true)(item1)).toBeTruthy();
    });

    it('should return false when item is not image', () => {
      expect(ItemUtils.fileFilter(11, true)(item2)).toBeFalsy();
    });

    it('should return false when item is not image when want non image file', () => {
      expect(ItemUtils.fileFilter(11, false)(item1)).toBeFalsy();
    });

    it('should return true when item is not image when want non image file', () => {
      expect(ItemUtils.fileFilter(11, false)(item2)).toBeTruthy();
    });

    it('should return false when item is not file', () => {
      item1.id = 111;
      expect(ItemUtils.fileFilter(11, true)(item1)).toBeFalsy();
    });
  });

  describe('eventFilter', () => {
    beforeEach(() => {
      clearMocks();
    });

    const item1 = {
      id: 14,
      group_ids: [11, 222, 33],
      start: 111,
      end: 9007199254740992,
    };

    const item2 = {
      id: 111,
      group_ids: [11, 222, 33],
    };

    it('should return false when is not event', () => {
      expect(ItemUtils.eventFilter(11)(item2)).toBeFalsy();
    });

    it('should return false when is over due event', () => {
      expect(ItemUtils.eventFilter(11)(item1)).toBeTruthy();
    });
  });
});
