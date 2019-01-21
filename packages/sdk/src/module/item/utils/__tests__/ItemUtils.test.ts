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

  describe('toSanitizedItem', () => {
    it('should return sanitized item', () => {
      const item = {
        id: 1111,
        group_ids: [123123],
        created_at: 1231233,
        name: '1231233',
      };

      expect(ItemUtils.toSanitizedItem(item)).toEqual({
        id: 1111,
        group_ids: [123123],
        created_at: 1231233,
      });
    });
  });

  describe('taskFilter', () => {
    it('should return true when want to show completed tasks', () => {
      const task = {
        id: 9,
        group_ids: [11, 222, 33],
        complete: true,
      };
      expect(ItemUtils.taskFilter(11, true)(task)).toBeTruthy();
    });

    it('should return false when dont want to show completed tasks', () => {
      const task = {
        id: 9,
        group_ids: [11, 222, 33],
        complete: true,
      };
      expect(ItemUtils.taskFilter(11, false)(task)).toBeFalsy();
    });

    it('should return true when want to show not completed tasks', () => {
      const task = {
        id: 9,
        group_ids: [11, 222, 33],
        complete: false,
      };
      expect(ItemUtils.taskFilter(11, false)(task)).toBeTruthy();
    });
  });
});
