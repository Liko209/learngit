/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:58:02
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';

import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
} from '../FetchSortableDataListHandler';
import {
  ISortableModel,
  ISortableModelWithData,
  ITransformFunc,
  IMatchFunc,
  ISortFunc,
} from '../types';

import { IdModel } from 'sdk/framework/model';
import { Group } from 'sdk/module/group/entity';
import storeManager from '../../../index';
import { ENTITY_NAME } from '@/store';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import GroupModel from '@/store/models/Group';
import { ENTITY, notificationCenter, EVENT_TYPES } from 'sdk/service';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { SortableListStore } from '../SortableListStore';

const PAGE_SIZE = 2;

jest.mock('sdk/api');

type SimpleItem = IdModel & {
  value: number;
};

function buildItem(id: number): SimpleItem {
  return { id, value: id };
}

function sortableTransformFunc(
  model: SimpleItem,
): ISortableModelWithData<SimpleItem> {
  return { data: model, id: model.id, sortValue: model.value };
}

function buildSortableModel(id: number) {
  return sortableTransformFunc(buildItem(id));
}

function matchInRange(target: SimpleItem) {
  return target.id >= 2 && target.id <= 10;
}

function expectFocResult(
  listHandler: FetchSortableDataListHandler<SimpleItem>,
  expectedId: number[],
) {
  expect(listHandler.listStore.items.map(item => item.id)).toEqual(expectedId);
  expect(listHandler.size).toEqual(expectedId.length);
}

const transformFunc: ITransformFunc<SimpleItem> = sortableTransformFunc;

const sortByDescFunc: ISortFunc<any> = (
  first: ISortableModel,
  second: ISortableModel,
) => second.sortValue - first.sortValue;

function buildReplacePayload(
  originalIds: number[],
  models: SimpleItem[],
  isReplaceAll = false,
) {
  const ids = originalIds;
  const entities = new Map<number, SimpleItem>();
  models.forEach((model: SimpleItem, index: number) => {
    entities.set(ids[index], model);
  });
  const payload: NotificationEntityPayload<SimpleItem> = {
    type: EVENT_TYPES.REPLACE,
    body: {
      ids,
      entities,
      isReplaceAll,
    },
  };
  return payload;
}

function buildPayload(
  type: EVENT_TYPES,
  models: SimpleItem[],
  originalIds?: number[],
) {
  let payload: NotificationEntityPayload<SimpleItem>;
  const entities = new Map<number, SimpleItem>();

  const ids = models.map(model => model.id);
  models.forEach((model: SimpleItem) => {
    entities.set(model.id, model);
  });

  switch (type) {
    case EVENT_TYPES.UPDATE:
      {
        payload = {
          type,
          body: {
            ids,
            entities,
          },
        };
      }
      break;

    case EVENT_TYPES.DELETE:
      {
        payload = {
          type,
          body: {
            ids,
          },
        };
      }
      break;
    case EVENT_TYPES.RELOAD:
      {
        payload = {
          type,
        };
      }
      break;
    case EVENT_TYPES.RESET:
      {
        payload = {
          type,
        };
      }
      break;
    case EVENT_TYPES.REPLACE:
      {
        if (!originalIds) throw new Error('Replace must have originalIds');
        payload = buildReplacePayload(originalIds, models);
      }
      break;
    default:
      throw new Error(`Can not build payload type: ${type}`);
  }

  return payload;
}

function setup(
  { originalItems }: { originalItems: SimpleItem[] },
  pageSize: number = PAGE_SIZE,
  customSortFunc?: ISortFunc<any>,
  eventName?: string,
  entityName?: ENTITY_NAME,
) {
  const dataProvider = new TestFetchSortableDataHandler<SimpleItem>();
  const listStore = new SortableListStore(customSortFunc);
  listStore.upsert(
    originalItems.map((item: SimpleItem) => {
      return { id: item.id, sortValue: item.value, data: item };
    }),
  );
  const fetchSortableDataHandler = new FetchSortableDataListHandler(
    dataProvider,
    {
      entityName,
      eventName,
      transformFunc,
      pageSize,
      sortFunc: customSortFunc,
      isMatchFunc: matchInRange,
    },
    listStore,
  );

  return {
    fetchSortableDataHandler,
    dataProvider,
    listStore,
  };
}

class TestFetchSortableDataHandler<T> implements IFetchSortableDataProvider<T> {
  mockTotalCount: number;
  mockData: { data: T[]; hasMore: boolean } = { data: [], hasMore: false };
  private _totalCount: number;
  fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModel,
  ): Promise<{ data: T[]; hasMore: boolean }> {
    return Promise.resolve(this.mockData);
  }

  totalCount() {
    return this._totalCount;
  }

  async fetchTotalCount() {
    return this.mockTotalCount;
  }
}

function notMatchFunc<T>(arg: T): boolean {
  return false;
}

function matchFunc<T>(arg: T): boolean {
  return true;
}

function numberTransformFunc(data: IdModel): ISortableModelWithData<IdModel> {
  return { data, id: data.id, sortValue: data.id };
}
describe('FetchSortableDataListHandler', () => {
  describe('fetchData()', () => {
    let fetchSortableDataHandler: FetchSortableDataListHandler<IdModel>;
    let dataProvider: TestFetchSortableDataHandler<IdModel>;
    const transformFunc: ITransformFunc<IdModel> = numberTransformFunc;
    const sortFunc: ISortFunc<any> = (
      first: ISortableModel,
      second: ISortableModel,
    ) => first.sortValue - second.sortValue;

    const isMatchFunc: IMatchFunc<IdModel> = notMatchFunc;

    beforeEach(() => {
      dataProvider = new TestFetchSortableDataHandler();
      fetchSortableDataHandler = new FetchSortableDataListHandler<IdModel>(
        dataProvider,
        { isMatchFunc, transformFunc, sortFunc, pageSize: 2 },
      );
    });

    it('should fetch data', async () => {
      const { fetchSortableDataHandler, dataProvider } = setup({
        originalItems: [],
      });

      dataProvider.mockData = {
        data: [buildItem(1), buildItem(2)],
        hasMore: true,
      };
      await fetchSortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);

      expect(
        fetchSortableDataHandler.hasMore(QUERY_DIRECTION.NEWER),
      ).toBeTruthy();
      expect(fetchSortableDataHandler.listStore.items).toEqual([
        buildSortableModel(1),
        buildSortableModel(2),
      ]);
    });

    it('should append data when fetch many times', async () => {
      const { fetchSortableDataHandler, dataProvider } = setup({
        originalItems: [],
      });

      dataProvider.mockData = { data: [buildItem(1)], hasMore: true };
      await fetchSortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
      dataProvider.mockData = { data: [buildItem(2)], hasMore: true };
      await fetchSortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
      dataProvider.mockData = { data: [buildItem(3)], hasMore: false };
      await fetchSortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);

      expect(fetchSortableDataHandler.listStore.items).toEqual([
        buildSortableModel(1),
        buildSortableModel(2),
        buildSortableModel(3),
      ]);
    });

    it('should update hasMore using return data', async () => {
      dataProvider.mockData = { data: [{ id: 1 }, { id: 2 }], hasMore: true };
      await fetchSortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
      expect(
        fetchSortableDataHandler.hasMore(QUERY_DIRECTION.NEWER),
      ).toBeTruthy();

      dataProvider.mockData = { data: [], hasMore: false };
      await fetchSortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
      expect(
        fetchSortableDataHandler.hasMore(QUERY_DIRECTION.NEWER),
      ).toBeFalsy();
    });
  });

  describe.each([
    /**
     * UPDATE
     */
    [
      'when add item',
      {
        originalItems: [],
        payload: buildPayload(EVENT_TYPES.UPDATE, [buildItem(2)]),
        expectedOrder: [2],
        expectedCallbackResponse: {
          added: [buildSortableModel(2)],
        },
      },
    ],
    [
      'when insert item between 3 and 5',
      {
        originalItems: [buildItem(3), buildItem(5)],
        payload: buildPayload(EVENT_TYPES.UPDATE, [buildItem(4)]),
        expectedOrder: [3, 4, 5],
        expectedCallbackResponse: {
          added: [buildSortableModel(4)],
        },
      },
    ],
    [
      'when update 5 between 3 and 5',
      {
        originalItems: [buildItem(3), buildItem(5)],
        payload: buildPayload(EVENT_TYPES.UPDATE, [{ id: 5, value: 2 }]),
        expectedOrder: [5, 3],
        expectedCallbackResponse: {
          added: [],
          deleted: [],
          updated: [{ data: { id: 5, value: 2 }, id: 5, sortValue: 2 }],
        },
      },
    ],
    [
      'when append after 3,5',
      {
        originalItems: [buildItem(3), buildItem(5)],
        payload: buildPayload(EVENT_TYPES.UPDATE, [buildItem(6)]),
        expectedOrder: [3, 5, 6],
        expectedCallbackResponse: {
          added: [buildSortableModel(6)],
        },
      },
    ],
    [
      'when trying to insert item that is not matched',
      {
        originalItems: [buildItem(3), buildItem(5)],
        payload: buildPayload(EVENT_TYPES.UPDATE, [buildItem(1)]),
        expectedOrder: [3, 5],
        callbackMuted: true,
        expectedCallbackResponse: {
          added: [],
        },
      },
    ],
    [
      'when trying to update a item that no in range',
      {
        originalItems: [
          buildItem(5),
          buildItem(1),
          buildItem(2),
          buildItem(3),
          buildItem(4),
        ],
        payload: buildReplacePayload([6], [{ id: 6, value: 9 }]),
        callbackMuted: true,
        expectedOrder: [1, 2, 3, 4, 5],
        expectedCallbackResponse: {
          added: [],
        },
      },
    ],
    [
      'when update item without update sort value',
      {
        originalItems: [buildItem(1), buildItem(2)],
        payload: buildPayload(EVENT_TYPES.UPDATE, [buildItem(2)]),
        expectedOrder: [1, 2],
        callbackMuted: true,
      },
    ],
    /**
     * REPLACE
     */
    [
      'when existed but not match',
      {
        originalItems: [
          buildItem(1),
          buildItem(2),
          buildItem(3),
          buildItem(4),
          buildItem(5),
        ],
        payload: buildReplacePayload([1], [{ id: 1, value: 10 }]),
        expectedOrder: [2, 3, 4, 5],
        expectedCallbackResponse: {
          deleted: [1],
          added: [],
        },
      },
    ],
    [
      'when replace a preinsert model',
      {
        originalItems: [
          buildItem(1),
          { id: -2, value: 2 },
          buildItem(3),
          buildItem(4),
          buildItem(5),
        ],
        payload: buildReplacePayload([-2], [buildItem(2)]),
        expectedOrder: [1, 2, 3, 4, 5],
        expectedCallbackResponse: {
          added: [buildSortableModel(2)],
          deleted: [-2],
        },
      },
    ],
    [
      'when replace all',
      {
        originalItems: [
          buildItem(1),
          buildItem(2),
          buildItem(3),
          buildItem(4),
          buildItem(5),
        ],
        payload: buildReplacePayload(
          [6, 7],
          [buildItem(6), buildItem(7)],
          true, // isReplaceAll
        ),
        expectedOrder: [6, 7],
        expectedCallbackResponse: {
          added: [buildSortableModel(6), buildSortableModel(7)],
          deleted: [1, 2, 3, 4, 5],
        },
      },
    ],
    /**
     * DELETE
     */
    [
      'when delete 2,4',
      {
        originalItems: [
          buildItem(1),
          buildItem(2),
          buildItem(3),
          buildItem(4),
          buildItem(5),
        ],
        payload: buildPayload(EVENT_TYPES.DELETE, [buildItem(2), buildItem(4)]),
        expectedOrder: [1, 3, 5],
        expectedCallbackResponse: {
          deleted: [2, 4],
        },
      },
    ],
    [
      'when trying to delete no existed item',
      {
        originalItems: [
          buildItem(1),
          buildItem(2),
          buildItem(3),
          buildItem(4),
          buildItem(5),
        ],
        payload: buildPayload(EVENT_TYPES.DELETE, [buildItem(6)]),
        expectedOrder: [1, 2, 3, 4, 5],
        expectedCallbackResponse: {
          deleted: [],
        },
      },
    ],
  ])(
    'onDataChange()',
    (
      when: string,
      {
        originalItems,
        payload,
        expectedOrder,
        expectedCallbackResponse,
        callbackMuted,
      }: any,
    ) => {
      it(`should have correct order ${when}`, () => {
        const { fetchSortableDataHandler: fetchSortableDataHandler2 } = setup({
          originalItems,
        });

        fetchSortableDataHandler2.onDataChanged(payload);

        expect(
          fetchSortableDataHandler2.listStore.items.map(item => item.id),
        ).toEqual(expectedOrder);
      });

      it(`should have correct order which is ordered by custom sort func,  ${when}`, () => {
        const { fetchSortableDataHandler: fetchSortableDataHandler2 } = setup(
          {
            originalItems,
          },
          PAGE_SIZE,
          sortByDescFunc,
        );

        fetchSortableDataHandler2.onDataChanged(payload);

        expect(
          fetchSortableDataHandler2.listStore.items.map(item => item.id),
        ).toEqual(_.reverse(expectedOrder));
      });

      it(`should notify callback ${when}`, () => {
        const { fetchSortableDataHandler } = setup({
          originalItems,
        });
        const dataChangeCallback = jest.fn();
        fetchSortableDataHandler.addDataChangeCallback(dataChangeCallback);
        fetchSortableDataHandler.onDataChanged(payload);
        if (callbackMuted) {
          expect(dataChangeCallback).not.toHaveBeenCalled();
          return;
        }
        expect(dataChangeCallback).toHaveBeenCalled();
        expect(dataChangeCallback).toHaveBeenCalledWith(
          expect.objectContaining(expectedCallbackResponse),
        );
        return;
      });
    },
  );

  describe('removeByIds()', () => {
    it('should remove by ids', () => {
      const originalItems = [
        buildItem(1),
        buildItem(2),
        buildItem(3),
        buildItem(4),
        buildItem(5),
      ];
      const { fetchSortableDataHandler } = setup({ originalItems });

      fetchSortableDataHandler.removeByIds([1, 2, 4]);

      expect(fetchSortableDataHandler.sortableListStore.items).toEqual([
        buildSortableModel(3),
        buildSortableModel(5),
      ]);
    });
  });

  describe('updateEntityStore()', () => {
    function groupTransformFunc(model: Group): ISortableModel {
      return {
        id: model.id,
        sortValue: model.most_recent_post_created_at || 0,
      };
    }

    const group: any = {
      id: 123,
      most_recent_post_created_at: 1000,
      created_at: 1000,
      modified_at: 1000,
      creator_id: 1000,
      is_new: false,
      deactivated: false,
      version: 1000,
      members: [],
      company_id: 888,
      set_abbreviation: '',
      email_friendly_abbreviation: '',
      most_recent_content_modified_at: 2000,
    };

    let fetchSortableDataHandler: FetchSortableDataListHandler<Group>;
    let dataProvider: TestFetchSortableDataHandler<Group>;

    const transformFunc: ITransformFunc<Group> = groupTransformFunc;
    const sortFunc: ISortFunc<any> = (
      first: ISortableModel,
      second: ISortableModel,
    ) => first.sortValue - second.sortValue;

    const isMatchFunc: IMatchFunc<Group> = matchFunc;
    beforeEach(async () => {
      dataProvider = new TestFetchSortableDataHandler();
      dataProvider.mockData = { data: [group], hasMore: true };

      fetchSortableDataHandler = new FetchSortableDataListHandler<Group>(
        dataProvider,
        {
          isMatchFunc,
          transformFunc,
          sortFunc,
          pageSize: 1,
          entityName: ENTITY_NAME.GROUP,
          eventName: ENTITY.GROUP,
        },
      );
      await fetchSortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
    });

    it('should have the group in group store', () => {
      const groupStore = storeManager.getEntityMapStore(
        ENTITY_NAME.GROUP,
      ) as MultiEntityMapStore<Group, GroupModel>;
      expect(groupStore.get(group.id)).toEqual(GroupModel.fromJS(group));
    });

    it('handle the group updated', () => {
      group.creator_id = 1001;
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [group]);
      const groupStore = storeManager.getEntityMapStore(
        ENTITY_NAME.GROUP,
      ) as MultiEntityMapStore<Group, GroupModel>;

      const updatedGroup = groupStore.get(group.id);

      expect(updatedGroup.creatorId).toEqual(1001);

      let newGroup: Group = {
        ...group,
        id: 456,
        most_recent_post_created_at: 99,
      };
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [newGroup]);

      expect(fetchSortableDataHandler.sortableListStore.getIds).toEqual([
        456,
        123,
      ]);

      newGroup = { ...group, id: 789, most_recent_post_created_at: 1002 };
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [newGroup]);
      expect(fetchSortableDataHandler.sortableListStore.getIds).toEqual([
        456,
        123,
      ]);
    });
  });

  describe('maintainMode', () => {
    let originalItems: SimpleItem[] = [];
    let foc: FetchSortableDataListHandler<SimpleItem>;
    let dProvider: TestFetchSortableDataHandler<SimpleItem>;
    const PAGE_SIZE_10 = 10;
    beforeEach(() => {
      originalItems = [];
      let pageSize = PAGE_SIZE_10;
      while (pageSize > 0) {
        originalItems.push(buildItem(pageSize));
        pageSize--;
      }

      const { fetchSortableDataHandler, dataProvider } = setup(
        { originalItems },
        PAGE_SIZE_10,
      );
      fetchSortableDataHandler.addDataChangeCallback(() => {});
      foc = fetchSortableDataHandler;
      dProvider = dataProvider;
    });
    it('Should return true when enter maintain mode', () => {
      expect(foc.maintainMode).toBeFalsy();
      foc.maintainMode = true;
      expect(foc.maintainMode).toBeTruthy();
    });
    it('Should keep the first page data when receive new data in maintainMode', () => {
      foc.maintainMode = true;
      foc.onDataChanged(
        buildPayload(EVENT_TYPES.UPDATE, [buildItem(2.5), buildItem(2.6)]),
      );

      expectFocResult(foc, [2.5, 2.6, 3, 4, 5, 6, 7, 8, 9, 10]);

      foc.maintainMode = false;
      foc.onDataChanged(buildPayload(EVENT_TYPES.UPDATE, [buildItem(3.5)]));

      expectFocResult(foc, [2.5, 2.6, 3, 3.5, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('Should keep all data when fetching new page data NOT in maintainMode', async () => {
      dProvider.mockData = {
        data: [buildItem(PAGE_SIZE_10 + 1), buildItem(PAGE_SIZE_10 + 2)],
        hasMore: true,
      };
      await foc.fetchData(QUERY_DIRECTION.OLDER);
      expectFocResult(foc, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it('Should keep the first page data when fetching a new page data in maintainMode', async () => {
      dProvider.mockData = {
        data: [buildItem(PAGE_SIZE_10 + 1), buildItem(PAGE_SIZE_10 + 2)],
        hasMore: true,
      };
      foc.maintainMode = true;
      await foc.fetchData(QUERY_DIRECTION.OLDER);
      expectFocResult(foc, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it('Should keep all data  when receive a new data NOT in maintainMode', () => {
      foc.onDataChanged(buildPayload(EVENT_TYPES.UPDATE, [buildItem(2.5)]));
      expect(foc.size).toEqual(PAGE_SIZE_10 + 1);
    });
  });

  describe('totalCountCallback', () => {
    let fetchSortableDataHandler: FetchSortableDataListHandler<SimpleItem>;
    let dataProvider: TestFetchSortableDataHandler<SimpleItem>;
    const eventName = 'SIMPLE_ITEM';

    let callbackFunc: any;
    beforeEach(() => {
      const result = setup(
        {
          originalItems: [],
        },
        PAGE_SIZE,
        undefined,
        eventName,
        ENTITY_NAME.GROUP,
      );
      fetchSortableDataHandler = result.fetchSortableDataHandler;
      dataProvider = result.dataProvider;
      callbackFunc = jest.fn();
      fetchSortableDataHandler.setTotalCountChangeCallback(callbackFunc);
    });

    it('should notify total count changed when receive item deleted', async (done: any) => {
      const id = [10];
      dataProvider.mockTotalCount = 11;
      notificationCenter.emitEntityDelete(eventName, id);
      setTimeout(() => {
        expect(callbackFunc).toBeCalledWith(11);
        done();
      },         100);
    });

    it('should notify total count changed when receive item updated/replaced', async (done: any) => {
      const simpleItem = { id: 10 };
      dataProvider.mockTotalCount = 12;
      notificationCenter.emitEntityUpdate(eventName, [simpleItem]);

      setTimeout(() => {
        expect(callbackFunc).toBeCalledWith(12);
        done();
      },         100);
    });
  });

  describe('refreshData()', () => {
    it('should call dataChangeCallback with expected parameters when lsitStore.items.length 2 and _pageSize is 2', () => {
      const { fetchSortableDataHandler } = setup({
        originalItems: [buildItem(1), buildItem(2)],
      });
      const dataChangeCallback = jest.fn();
      fetchSortableDataHandler.addDataChangeCallback(dataChangeCallback);
      fetchSortableDataHandler.refreshData();
      expect(dataChangeCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          added: fetchSortableDataHandler.listStore.items,
          updated: [],
          deleted: [],
        }),
      );
    });
    it('should call dataChangeCallback with expected parameters when lsitStore.items.length is 5 and _pageSize is 2', () => {
      const { fetchSortableDataHandler } = setup({
        originalItems: [
          buildItem(1),
          buildItem(2),
          buildItem(3),
          buildItem(4),
          buildItem(5),
        ],
      });
      const mockSortableResult = fetchSortableDataHandler.listStore.items.slice(
        3,
        5,
      );
      const dataChangeCallback = jest.fn();
      fetchSortableDataHandler.addDataChangeCallback(dataChangeCallback);

      fetchSortableDataHandler.refreshData();
      expect(dataChangeCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          added: mockSortableResult,
          updated: [],
          deleted: [],
        }),
      );
    });
  });

  describe('handle data order changed', () => {
    function toItems(ids: number[]) {
      return ids.map((id: number) => {
        return buildItem(id);
      });
    }
    function update(arr: number[]) {
      const items = toItems(arr);
      return buildPayload(EVENT_TYPES.UPDATE, items);
    }

    it.each`
      originalItemsIds   | payloadIds      | olderOrder         | expectedOrder      | sortOrder
      ${[2, 3, 4, 5]}    | ${[2]}          | ${[2, 3, 4, 5]}    | ${[3, 2, 4, 5]}    | ${[3, 2, 4, 5]}
      ${[2, 3, 4, 5]}    | ${[2, 3]}       | ${[2, 3, 4, 5]}    | ${[4, 5, 2, 3]}    | ${[4, 5, 2, 3]}
      ${[1, 2, 3, 4, 5]} | ${[2]}          | ${[1, 2, 3, 4, 5]} | ${[1, 3, 2, 4, 5]} | ${[1, 3, 2, 4, 5]}
      ${[1, 2, 3, 4, 5]} | ${[3]}          | ${[1, 2, 3, 4, 5]} | ${[1, 3, 2, 4, 5]} | ${[1, 3, 2, 4, 5]}
      ${[1, 2, 3, 4, 5]} | ${[3]}          | ${[1, 2, 3, 4, 5]} | ${[5, 4, 3, 2, 1]} | ${[5, 4, 3, 2, 1]}
      ${[1, 2, 3, 4, 5]} | ${[4]}          | ${[1, 2, 3, 4, 5]} | ${[1, 2, 3, 5, 4]} | ${[1, 2, 3, 5, 4]}
      ${[1, 2, 3, 4, 5]} | ${[5]}          | ${[1, 2, 3, 4, 5]} | ${[1, 2, 3, 5, 4]} | ${[1, 2, 3, 5, 4]}
      ${[1, 2, 3, 4, 5]} | ${[1, 2]}       | ${[1, 2, 3, 4, 5]} | ${[2, 3, 4, 5]}    | ${[1, 2, 3, 5, 4]}
      ${[1, 2, 3, 4, 5]} | ${[1, 2, 4, 5]} | ${[1, 2, 3, 4, 5]} | ${[5, 4, 3, 2]}    | ${[5, 4, 3, 2, 1]}
      ${[1, 2, 3, 4, 5]} | ${[3]}          | ${[1, 2, 3, 4, 5]} | ${[1, 2, 4, 5, 3]} | ${[1, 2, 4, 5, 3]}
      ${[1, 2, 3, 4, 5]} | ${[5]}          | ${[1, 2, 3, 4, 5]} | ${[1, 2, 3, 4, 5]} | ${[1, 2, 4, 5, 3]}
      ${[1, 2, 3, 4, 5]} | ${[2, 3, 4, 5]} | ${[1, 2, 3, 4, 5]} | ${[1, 2, 3, 4, 5]} | ${[1, 2, 3, 4, 5]}
    `(
      'should update item list when order changed, expectedOrder : $expectedOrder',
      ({
        originalItemsIds,
        payloadIds,
        olderOrder,
        expectedOrder,
        sortOrder,
      }) => {
        const originalItems = toItems(originalItemsIds);
        const payload = update(payloadIds);
        let sources = olderOrder;
        const customSortFunc = (
          first: ISortableModel,
          second: ISortableModel,
        ) => {
          return sources.indexOf(first.id) - sources.indexOf(second.id);
        };
        const { fetchSortableDataHandler } = setup(
          {
            originalItems,
          },
          20,
          customSortFunc,
        );

        const dataChangeCallback = jest.fn();
        fetchSortableDataHandler.addDataChangeCallback(dataChangeCallback);
        sources = sortOrder;
        fetchSortableDataHandler.onDataChanged(payload);
        expect(
          fetchSortableDataHandler.listStore.items.map(item => item.id),
        ).toEqual(expectedOrder);
      },
    );
  });
});
