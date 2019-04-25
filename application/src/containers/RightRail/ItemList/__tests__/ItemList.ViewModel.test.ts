/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { ItemService, ITEM_SORT_KEYS } from 'sdk/module/item';
import { ItemListViewModel } from '../ItemList.ViewModel';
import { RIGHT_RAIL_ITEM_TYPE } from '../constants';
import { observable, reaction } from 'mobx';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('sdk/module/item');

let dataSource: ItemListViewModel;
let itemService: ItemService;

describe('ItemListViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    itemService = {
      getGroupItemsCount: jest.fn(),
    };
    ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);
  });

  describe('loadInitialData()', () => {
    it('Should be call sortableDataHandler fetchData', async () => {
      const _sortableDataHandler = {
        sortableListStore: {
          getIds: jest.fn().mockReturnValue([1, 2]),
        },
        fetchData: jest.fn(),
        setHasMore: jest.fn(),
      };
      dataSource = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES,
      });
      Object.assign(dataSource, {
        _sortableDataHandler,
      });
      await dataSource.loadInitialData();
      expect(_sortableDataHandler.fetchData).toHaveBeenCalled();
    });
  });

  describe('getIds()', () => {
    it('Should be add id if getIds change [JPT-850, JPT-843]', () => {
      dataSource = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
      });
      let _sortableDataHandler = {
        sortableListStore: {
          get getIds() {
            return jest.fn().mockReturnValue([1, 2])();
          },
          fetchData: jest.fn(),
        },
      };

      Object.assign(dataSource, {
        _sortableDataHandler,
      });

      expect(dataSource.getIds).toEqual([1, 2]);

      _sortableDataHandler = {
        sortableListStore: {
          get getIds() {
            return jest.fn().mockReturnValue([1, 2, 3])();
          },
        },
      };

      Object.assign(dataSource, {
        _sortableDataHandler,
      });
      expect(dataSource.getIds).toEqual([1, 2, 3]);
    });

    it('Should be remove id if getIds change [JPT-851, JPT-844]', () => {
      dataSource = new ItemListViewModel({
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

      Object.assign(dataSource, {
        _sortableDataHandler,
      });
      expect(dataSource.getIds).toEqual([1, 2]);

      _sortableDataHandler = {
        sortableListStore: {
          get getIds() {
            return jest.fn().mockReturnValue([1])();
          },
        },
      };

      Object.assign(dataSource, {
        _sortableDataHandler,
      });
      expect(dataSource.getIds).toEqual([1]);
    });
  });

  describe('total()', () => {
    it.skip('Check the sum of events when add/deleted event [JPT-983, JPT-984]', (done: jest.DoneCallback) => {
      itemService.getGroupItemsCount.mockResolvedValue(10);
      dataSource = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.EVENTS,
      });

      const ids = observable.array([1, 2, 3, 4, 5]);
      const _sortableDataHandler = {
        sortableListStore: observable.object({
          get getIds() {
            return ids;
          },
        }),
        fetchData: jest.fn(),
      };

      Object.assign(dataSource, {
        _sortableDataHandler,
      });

      setImmediate(() => {
        // Initial total
        expect(itemService.getGroupItemsCount).toHaveBeenCalled();
        expect(dataSource.total()).toBe(10);

        itemService.getGroupItemsCount.mockClear();

        // When add item, should fetch total again
        itemService.getGroupItemsCount.mockResolvedValue(11);
        ids.push(6);
        dataSource.groupId = 2;
        setImmediate(() => {
          expect(itemService.getGroupItemsCount).toHaveBeenCalled();
          expect(dataSource.total()).toBe(11);

          itemService.getGroupItemsCount.mockClear();

          // When remove item, should fetch total again
          itemService.getGroupItemsCount.mockResolvedValue(10);
          ids.remove(1);
          setImmediate(() => {
            expect(dataSource.total()).toBe(10);
            done();
          });
        });
      });
    });
  });

  describe('getSort()', () => {
    it('Events displays by order of start time [JPT-981]', async () => {
      dataSource = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.EVENTS,
      });
      expect(dataSource.getSort().sortKey).toBe(ITEM_SORT_KEYS.START_TIME);
    });

    it('Tasks displays by order of tasks created time [JPT-982]', async () => {
      dataSource = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
      });
      expect(dataSource.getSort().sortKey).toBe(ITEM_SORT_KEYS.CREATE_TIME);
    });

    it('should image files display by order of files update time', async () => {
      dataSource = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES,
      } as any);
      expect(dataSource.getSort().sortKey).toBe(ITEM_SORT_KEYS.LATEST_POST_ID);
    });

    it('should show files but not image display by order of files latest post id', async () => {
      dataSource = new ItemListViewModel({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES,
      } as any);
      expect(dataSource.getSort().sortKey).toBe(ITEM_SORT_KEYS.LATEST_POST_ID);
    });
  });
});
