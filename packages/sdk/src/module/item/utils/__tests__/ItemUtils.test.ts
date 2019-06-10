/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-14 10:41:04
 * Copyright © RingCentral. All rights reserved.
 */
import { ItemUtils } from '../ItemUtils';
import { SanitizedEventItem } from '../../module/event/entity';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('ItemUtils', () => {
  beforeEach(() => {
    clearMocks();
  });

  describe('isValidItem()', () => {
    beforeEach(() => {
      clearMocks();
    });

    const item1 = {
      id: 10,
      group_ids: [11, 222, 33],
    };

    it('should return true when item is valid', () => {
      expect(ItemUtils.isValidItem(11, item1)).toBeTruthy();
    });

    it('should return false when item group id is not exist in the post', () => {
      expect(ItemUtils.isValidItem(88, item1)).toBeFalsy();
    });
  });

  describe('fileFilter()', () => {
    const item1 = {
      id: 10,
      group_ids: [11, 222, 33],
      type: 'JPG',
    };

    const item2 = {
      id: 10,
      group_ids: [11, 222, 33],
      type: 'doc',
    };

    it('should return false when item is not image when want non image file', () => {
      expect(ItemUtils.fileFilter(11)(item1)).toBeFalsy();
    });

    it('should return true when item is not image when want non image file', () => {
      expect(ItemUtils.fileFilter(11)(item2)).toBeTruthy();
    });
  });

  describe('imageFilter()', () => {
    const item1 = {
      id: 10,
      group_ids: [11, 222, 33],
      type: 'JPG',
    };

    const item2 = {
      id: 10,
      group_ids: [11, 222, 33],
      type: 'doc',
    };

    it('should return true when item is image type', () => {
      expect(ItemUtils.imageFilter(11)(item1)).toBeTruthy();
    });

    it('should return false when item is not image', () => {
      expect(ItemUtils.imageFilter(11)(item2)).toBeFalsy();
    });

    it('should return false when item is not file', () => {
      item1.id = 111;
      expect(ItemUtils.imageFilter(11)(item1)).toBeFalsy();
    });
  });

  describe('eventFilter()', () => {
    beforeEach(() => {
      clearMocks();
    });

    const item1 = {
      id: 14,
      group_ids: [11, 222, 33],
      start: 111,
      end: 333,
      effective_end: 3333,
      created_at: 111,
      modified_at: 111,
    } as SanitizedEventItem;

    const item2 = {
      id: 111,
      group_ids: [11, 222, 33],
      created_at: 111,
      modified_at: 111,
    } as SanitizedEventItem;

    const item3 = {
      id: 14,
      group_ids: [11, 222, 33],
      start: 111,
      end: 333,
      effective_end: 9007199254740992,
      created_at: 111,
      modified_at: 111,
    } as SanitizedEventItem;

    const item4 = {
      id: 14,
      group_ids: [11, 222, 33],
      start: 111,
      end: 333,
      effective_end: 9007199254740,
      created_at: 111,
      modified_at: 111,
    } as SanitizedEventItem;

    it('should return false when is not event', () => {
      expect(ItemUtils.eventFilter(11)(item2)).toBeFalsy();
    });
    // skip the warning case until @thomas to fixed it
    it.skip('should return true when is not over due event', () => {
      expect(ItemUtils.eventFilter(11)(item4)).toBeTruthy();
    });

    it.skip('should return false when is over due event', () => {
      expect(ItemUtils.eventFilter(11)(item1)).toBeFalsy();
    });

    it('should return true when effect time is max int', () => {
      expect(ItemUtils.eventFilter(11)(item3)).toBeTruthy();
    });
  });

  describe('taskFilter()', () => {
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
