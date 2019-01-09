/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { ItemListViewModel } from '../ItemList.ViewModel';

let ViewModel: ItemListViewModel;

describe('ItemListViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('consturctor()', () => {
    it('should call sortableDataHandler fetchData', () => {
      const _sortableDataHandler = {
        fetchData: jest.fn(),
      };
      ViewModel = new ItemListViewModel();
      Object.assign(ViewModel, {
        _sortableDataHandler,
        _sortKey: 'time',
        _desc: false,
        _groupId: 1,
        _typeId: 10,
      });
      expect(true).toEqual(false);
    });
  });
});
