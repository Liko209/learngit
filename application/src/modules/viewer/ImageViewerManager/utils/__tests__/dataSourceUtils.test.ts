/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-06 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import 'jest';
import { VIEWER_ITEM_TYPE } from '../../constants';
import { Item } from 'sdk/module/item/entity';
import { TypeDictionary } from 'sdk/utils/glip-type-dictionary';
import {
  isExpectedItemOfThisGroup,
  getNextItemToDisplay,
  getTypeId,
  getFilterFunc,
} from '../dataSourceUtils';

describe('dataSourceUtils', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('isExpectedItemOfThisGroup()', () => {
    const fileId = TypeDictionary.TYPE_ID_FILE;
    const notFileId = TypeDictionary.TYPE_ID_TASK;
    it.each`
      expected | groupId | groupIds | postIds | itemId    | deactivated | includeDeactivated
      ${true}  | ${1}    | ${[1]}   | ${[11]} | ${fileId} | ${false}    | ${false}
      ${false} | ${0}    | ${[1]}   | ${[11]} | ${fileId} | ${false}    | ${false}
      ${false} | ${1}    | ${[2]}   | ${[11]} | ${fileId} | ${false}    | ${false}
      ${false} | ${1}    | ${[]}    | ${[11]} | ${fileId} | ${false}    | ${false}
      ${false} | ${1}    | ${[1]}   | ${[11]} | ${fileId} | ${true}     | ${false}
      ${true}  | ${1}    | ${[1]}   | ${[11]} | ${fileId} | ${false}    | ${true}
      ${true}  | ${1}    | ${[1]}   | ${[11]} | ${fileId} | ${true}     | ${true}
    `(
      'should work correctly with Image type',
      ({
        groupId,
        groupIds,
        postIds,
        itemId,
        deactivated,
        includeDeactivated,
        expected,
      }) => {
        const item: Item = {
          deactivated,
          id: itemId,
          group_ids: groupIds,
          post_ids: postIds,
          type: 'jpg',
        } as Item;
        const result = isExpectedItemOfThisGroup(
          groupId,
          VIEWER_ITEM_TYPE.IMAGE_FILES,
          item,
          includeDeactivated,
        );
        expect(result).toEqual(expected);
      },
    );
    it.each`
      expected | groupId | groupIds | postIds | itemId       | deactivated | includeDeactivated
      ${false} | ${1}    | ${[1]}   | ${[11]} | ${notFileId} | ${false}    | ${false}
      ${false} | ${0}    | ${[1]}   | ${[11]} | ${notFileId} | ${false}    | ${false}
      ${false} | ${1}    | ${[2]}   | ${[11]} | ${notFileId} | ${false}    | ${false}
      ${false} | ${1}    | ${[]}    | ${[11]} | ${notFileId} | ${false}    | ${false}
      ${false} | ${1}    | ${[1]}   | ${[11]} | ${notFileId} | ${true}     | ${false}
      ${false} | ${1}    | ${[1]}   | ${[11]} | ${notFileId} | ${false}    | ${true}
      ${false} | ${1}    | ${[1]}   | ${[11]} | ${notFileId} | ${true}     | ${true}
    `(
      'should work correctly with Image type when item not a image',
      ({
        groupId,
        groupIds,
        postIds,
        itemId,
        deactivated,
        includeDeactivated,
        expected,
      }) => {
        const item: Item = {
          deactivated,
          id: itemId,
          group_ids: groupIds,
          post_ids: postIds,
        } as Item;
        const result = isExpectedItemOfThisGroup(
          groupId,
          VIEWER_ITEM_TYPE.IMAGE_FILES,
          item,
          includeDeactivated,
        );
        expect(result).toEqual(expected);
      },
    );
  });

  describe('getNextItemToDisplay() [JPT-2033]', () => {
    it.each`
      historyIds | currentIds | lastItemId | lastItemIndex
      ${[123]}   | ${[]}      | ${123}     | ${0}
      ${[2, 3]}  | ${[]}      | ${3}       | ${1}
    `(
      'should return -1 when there is no other items available in ids',
      ({ historyIds, currentIds, lastItemId, lastItemIndex }) => {
        expect(
          getNextItemToDisplay(
            historyIds,
            currentIds,
            lastItemId,
            lastItemIndex,
          ),
        ).toEqual({ index: -1, itemId: -1 });
      },
    );

    it.each`
      historyIds       | currentIds   | lastItemId | lastItemIndex | expected
      ${[1, 123, 111]} | ${[1, 111]}  | ${123}     | ${1}          | ${{ index: 1, itemId: 111 }}
      ${[1, 23]}       | ${[23]}      | ${1}       | ${0}          | ${{ index: 0, itemId: 23 }}
      ${[1, 2, 3, 4]}  | ${[1, 3, 4]} | ${2}       | ${4}          | ${{ index: 4, itemId: 3 }}
      ${[1, 2, 3, 4]}  | ${[1, 4]}    | ${2}       | ${4}          | ${{ index: 4, itemId: 4 }}
    `(
      'should return next available item when it exists',
      ({ historyIds, currentIds, lastItemId, lastItemIndex, expected }) => {
        expect(
          getNextItemToDisplay(
            historyIds,
            currentIds,
            lastItemId,
            lastItemIndex,
          ),
        ).toEqual(expected);
      },
    );

    it.each`
      historyIds      | currentIds | lastItemId | lastItemIndex | expected
      ${[1, 2, 3]}    | ${[1, 2]}  | ${3}       | ${4}          | ${{ index: 3, itemId: 2 }}
      ${[1, 2, 3, 4]} | ${[1, 2]}  | ${4}       | ${5}          | ${{ index: 3, itemId: 2 }}
    `(
      'should return last available item when it exists and there is no next item available',
      ({ historyIds, currentIds, lastItemId, lastItemIndex, expected }) => {
        expect(
          getNextItemToDisplay(
            historyIds,
            currentIds,
            lastItemId,
            lastItemIndex,
          ),
        ).toEqual(expected);
      },
    );
  });
  describe('getTypeId()', () => {
    it('should return', () => {
      expect(getTypeId(0)).toEqual(10);
    });
  });
  describe('getFilterFunc()', () => {
    it('should ItemUtils.imageFilter to been called', () => {
      const item: Item = {
        deactivated: false,
        id: 0,
        group_ids: 0,
        post_ids: 0,
      } as Item;
      const funC = getFilterFunc(0, 0);
      expect(funC && funC(null)).toEqual(false);
      expect(funC && funC(item)).toEqual(false);
    });
    it('should return', () => {
      const funC = getFilterFunc(0, 1);
      expect(funC).toEqual(undefined);
    });
  });
});
