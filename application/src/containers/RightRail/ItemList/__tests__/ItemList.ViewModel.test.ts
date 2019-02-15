/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { ItemService, ITEM_SORT_KEYS } from 'sdk/module/item';
import { ItemListViewModel } from '../ItemList.ViewModel';
import { RIGHT_RAIL_ITEM_TYPE } from '../constants';

jest.mock('sdk/module/item');

let ViewModel: ItemListViewModel;
let itemService: ItemService;

describe('ItemListViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    itemService = {
      getGroupItemsCount: jest.fn().mockReturnValue(1),
    };
    ItemService.getInstance = jest.fn().mockReturnValue(itemService);
  });

  describe('fetchNextPageItems()', () => {
    it('Should be call sortableDataHandler fetchData', async () => {
      const _sortableDataHandler = {
        sortableListStore: {
          getIds: jest.fn().mockReturnValue([1, 2]),
        },
        fetchData: jest.fn(),
      };
      ViewModel = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES,
        active: true,
      });
      Object.assign(ViewModel, {
        _sortableDataHandler,
        _sortKey: 'time',
        _desc: false,
      });
      ViewModel.loadStatus.loading = false;
      await ViewModel.fetchNextPageItems();
      expect(_sortableDataHandler.fetchData).toHaveBeenCalled();
    });
  });

  describe('get ids', () => {
    it('Should be add id if getIds change [JPT-850, JPT-843]', () => {
      ViewModel = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
        active: true,
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

    it('Should be remove id if getIds change [JPT-851, JPT-844]', () => {
      ViewModel = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
        active: true,
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

  describe('loadTotalCount()', () => {
    it('Check the sum of events when add/deleted event [JPT-983, JPT-984]', async () => {
      jest.spyOn(itemService, 'getGroupItemsCount').mockResolvedValue(1);
      ViewModel = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.EVENTS,
        active: true,
      });
      const _getFilterFunc = () => {};
      Object.assign(ViewModel, {
        _getFilterFunc,
      });
      await ViewModel.loadTotalCount();
      expect(ViewModel.totalCount).toBe(1);

      jest.spyOn(itemService, 'getGroupItemsCount').mockResolvedValue(2);
      await ViewModel.loadTotalCount();
      expect(ViewModel.totalCount).toBe(2);

      jest.spyOn(itemService, 'getGroupItemsCount').mockResolvedValue(1);
      await ViewModel.loadTotalCount();
      expect(ViewModel.totalCount).toBe(1);
    });
  });

  describe('sort key', () => {
    it('Events displays by order of start time [JPT-981]', async () => {
      ViewModel = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.EVENTS,
        active: true,
      });
      expect(ViewModel.sort.sortKey).toBe(ITEM_SORT_KEYS.START_TIME);
    });
    it('Tasks displays by order of tasks created time [JPT-982]', async () => {
      ViewModel = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
        active: true,
      });
      expect(ViewModel.sort.sortKey).toBe(ITEM_SORT_KEYS.CREATE_TIME);
    });
  });
});
