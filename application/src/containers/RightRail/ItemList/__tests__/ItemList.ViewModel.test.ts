/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { ItemListViewModel } from '../ItemList.ViewModel';
import { RIGHT_RAIL_ITEM_TYPE } from '../constants';

let ViewModel: ItemListViewModel;

describe('ItemListViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('fetchNextPageItems()', () => {
    it('Should be call sortableDataHandler fetchData', () => {
      const _sortableDataHandler = {
        sortableListStore: {
          getIds: jest.fn().mockReturnValue([1, 2]),
        },
        fetchData: jest.fn(),
      };
      ViewModel = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES,
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

  describe('get ids', () => {
    it('Should be add id if getIds change [JPT-850]', () => {
      ViewModel = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
      });
      const sortableListStore = {};
      let _sortableDataHandler = {
        sortableListStore: {
          get getIds() {
            return jest.fn().mockReturnValue([1, 2])();
          },
        },
      };

      Object.assign(ViewModel, {
        _sortableDataHandler,
        _sortKey: 'time',
        _desc: false,
      });

      expect(ViewModel.ids).toEqual([1, 2]);

      _sortableDataHandler = {
        sortableListStore: {
          get getIds() {
            return jest.fn().mockReturnValue([1, 2, 3])();
          },
        },
      };

      Object.assign(ViewModel, {
        _sortableDataHandler,
      });
      expect(ViewModel.ids).toEqual([1, 2, 3]);
    });

    it('Should be remove id if getIds change [JPT-851]', () => {
      ViewModel = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
      });
      let _sortableDataHandler = {
        sortableListStore: {
          get getIds() {
            return jest.fn().mockReturnValue([1, 2])();
          },
        },
      };

      Object.assign(ViewModel, {
        _sortableDataHandler,
        _sortKey: 'time',
        _desc: false,
      });
      expect(ViewModel.ids).toEqual([1, 2]);

      _sortableDataHandler = {
        sortableListStore: {
          get getIds() {
            return jest.fn().mockReturnValue([1])();
          },
        },
      };

      Object.assign(ViewModel, {
        _sortableDataHandler,
      });
      expect(ViewModel.ids).toEqual([1]);
    });
  });
});
