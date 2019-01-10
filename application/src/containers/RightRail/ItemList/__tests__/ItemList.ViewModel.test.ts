/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { ItemListViewModel } from '../ItemList.ViewModel';
import { ITEM_LIST_TYPE } from '../../types';

let ViewModel: ItemListViewModel;

describe('ItemListViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('fetchNextPageItems()', () => {
    it('should be call sortableDataHandler fetchData', () => {
      const _sortableDataHandler = {
        fetchData: jest.fn(),
      };
      ViewModel = new ItemListViewModel({
        groupId: 1,
        type: ITEM_LIST_TYPE.FILE,
      });
      Object.assign(ViewModel, {
        _sortableDataHandler,
        _sortKey: 'time',
        _desc: false,
      });
      ViewModel.fetchNextPageItems();
      expect(_sortableDataHandler.fetchData).toHaveBeenCalled();
    });
  });
});
