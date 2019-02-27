/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { ItemListViewModel } from '../ItemList.ViewModel';
import { ItemListDataSource } from '../ItemList.DataSource';
import { RIGHT_RAIL_ITEM_TYPE } from '../constants';

describe('ItemListViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('get dataSource', () => {
    it('should return a dataSource', () => {
      const vm = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES,
        active: true,
      });
      expect(vm.dataSource).toBeInstanceOf(ItemListDataSource);
      expect(vm.dataSource.groupId).toBe(1);
      expect(vm.dataSource.type).toBe(RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES);
    });
  });
});
