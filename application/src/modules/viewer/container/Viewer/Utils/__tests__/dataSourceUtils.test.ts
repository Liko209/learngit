/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-04-06 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

// import { observable, action } from 'mobx';

import { VIEWER_ITEM_TYPE } from '../../constants';
import { Item } from 'sdk/module/item/entity';
import { TypeDictionary } from 'sdk/utils/glip-type-dictionary';
import { isExpectedItemOfThisGroup } from '../dataSourceUtils';

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
});
