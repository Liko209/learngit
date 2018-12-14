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
  ITransformFunc,
  IMatchFunc,
  ISortFunc,
} from '../types';

import { BaseModel, Group } from 'sdk/models';
import storeManager from '../../../index';
import { ENTITY_NAME } from '@/store';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import GroupModel from '@/store/models/Group';
import { ENTITY, notificationCenter, EVENT_TYPES } from 'sdk/service';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { SortableListStore } from '../SortableListStore';

type SimpleModel = BaseModel & {
  value: number;
};

function buildModel(id: number): SimpleModel {
  return { id, value: id };
}

function sortableTransformFunc(model: SimpleModel): ISortableModel {
  return { data: model, id: model.id, sortValue: model.value };
}

function buildSortableModel(id: number) {
  return sortableTransformFunc(buildModel(id));
}

function matchInRange(target: SimpleModel) {
  return target.id >= 2 && target.id <= 10;
}

const transformFunc: ITransformFunc<SimpleModel> = sortableTransformFunc;
const sortFunc: ISortFunc<any> = (
  first: ISortableModel,
  second: ISortableModel,
) => first.sortValue - second.sortValue;

function buildReplacePayload(
  originalIds: number[],
  models: SimpleModel[],
  isReplaceAll = false,
) {
  const ids = originalIds;
  const entities = new Map<number, SimpleModel>();
  models.forEach((model: SimpleModel, index: number) => {
    entities.set(ids[index], model);
  });
  const payload: NotificationEntityPayload<SimpleModel> = {
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
  models: SimpleModel[],
  originalIds?: number[],
) {
  let payload: NotificationEntityPayload<SimpleModel>;
  const entities = new Map<number, SimpleModel>();

  const ids = models.map(model => model.id);
  models.forEach((model: SimpleModel) => {
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

function setup({ originalItems }: { originalItems: SimpleModel[] }) {
  const dataProvider = new TestFetchSortableDataHandler<SimpleModel>();
  const listStore = new SortableListStore<SimpleModel>(sortFunc);
  listStore.append(
    originalItems.map((item: SimpleModel) => {
      return { id: item.id, sortValue: item.value, data: item };
    }),
  );
  const fetchSortableDataHandler = new FetchSortableDataListHandler(
    dataProvider,
    { transformFunc, sortFunc, isMatchFunc: matchInRange, pageSize: 2 },
    listStore,
  );

  return {
    fetchSortableDataHandler,
    dataProvider,
    listStore,
  };
}

class TestFetchSortableDataHandler<T> implements IFetchSortableDataProvider<T> {
  mockData: { data: T[]; hasMore: boolean } = { data: [], hasMore: false };

  fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModel<T>,
  ): Promise<{ data: T[]; hasMore: boolean }> {
    return Promise.resolve(this.mockData);
  }
}

function notMatchFunc<T>(arg: T): boolean {
  return false;
}

function matchFunc<T>(arg: T): boolean {
  return true;
}

function numberTransformFunc(data: BaseModel): ISortableModel<BaseModel> {
  return { data, id: data.id, sortValue: data.id };
}
describe('FetchSortableDataListHandler', () => {
  describe('fetchData()', () => {
    let fetchSortableDataHandler: FetchSortableDataListHandler<BaseModel>;
    let dataProvider: TestFetchSortableDataHandler<BaseModel>;
    const transformFunc: ITransformFunc<BaseModel> = numberTransformFunc;
    const sortFunc: ISortFunc<any> = (
      first: ISortableModel,
      second: ISortableModel,
    ) => first.sortValue - second.sortValue;

    const isMatchFunc: IMatchFunc<BaseModel> = notMatchFunc;

    beforeEach(() => {
      dataProvider = new TestFetchSortableDataHandler();
      fetchSortableDataHandler = new FetchSortableDataListHandler<BaseModel>(
        dataProvider,
        { isMatchFunc, transformFunc, sortFunc, pageSize: 2 },
      );
    });

    it('should fetch data', async () => {
      const { fetchSortableDataHandler, dataProvider } = setup({
        originalItems: [],
      });

      dataProvider.mockData = {
        data: [buildModel(1), buildModel(2)],
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

      dataProvider.mockData = { data: [buildModel(1)], hasMore: true };
      await fetchSortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
      dataProvider.mockData = { data: [buildModel(2)], hasMore: true };
      await fetchSortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
      dataProvider.mockData = { data: [buildModel(3)], hasMore: false };
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
        payload: buildPayload(EVENT_TYPES.UPDATE, [buildModel(2)]),
        expectedOrder: [2],
        expectedCallbackResponse: {
          added: [buildSortableModel(2)],
        },
      },
    ],
    [
      'when insert item between 3 and 5',
      {
        originalItems: [buildModel(3), buildModel(5)],
        payload: buildPayload(EVENT_TYPES.UPDATE, [buildModel(4)]),
        expectedOrder: [3, 4, 5],
        expectedCallbackResponse: {
          added: [buildSortableModel(4)],
        },
      },
    ],
    [
      'when insert item between 3 and 5',
      {
        originalItems: [buildModel(3), buildModel(5)],
        payload: buildPayload(EVENT_TYPES.UPDATE, [{ id: 5, value: 2 }]),
        expectedOrder: [5, 3],
        expectedCallbackResponse: {
          updated: [
            {
              index: 0,
              oldValue: buildSortableModel(5),
              value: { data: { id: 5, value: 2 }, id: 5, sortValue: 2 },
            },
          ],
        },
      },
    ],
    [
      'when append after 3,5',
      {
        originalItems: [buildModel(3), buildModel(5)],
        payload: buildPayload(EVENT_TYPES.UPDATE, [buildModel(6)]),
        expectedOrder: [3, 5, 6],
        expectedCallbackResponse: {
          added: [buildSortableModel(6)],
        },
      },
    ],
    [
      'when trying to insert item that is not matched',
      {
        originalItems: [buildModel(3), buildModel(5)],
        payload: buildPayload(EVENT_TYPES.UPDATE, [buildModel(1)]),
        expectedOrder: [3, 5],
        expectedCallbackResponse: {
          added: [],
        },
      },
    ],
    [
      'when trying to update a item that no in range',
      {
        originalItems: [
          buildModel(5),
          buildModel(1),
          buildModel(2),
          buildModel(3),
          buildModel(4),
        ],
        payload: buildReplacePayload([6], [{ id: 6, value: 9 }]),
        expectedOrder: [1, 2, 3, 4, 5],
        expectedCallbackResponse: {
          added: [],
        },
      },
    ],
    [
      'when existed but not match',
      {
        originalItems: [
          buildModel(1),
          buildModel(2),
          buildModel(3),
          buildModel(4),
          buildModel(5),
        ],
        payload: buildReplacePayload([1], [{ id: 1, value: 10 }]),
        expectedOrder: [2, 3, 4, 5],
        expectedCallbackResponse: {
          deleted: [1],
          added: [],
        },
      },
    ],
    /**
     * REPLACE
     */
    [
      'when replace a preinsert model',
      {
        originalItems: [
          buildModel(1),
          { id: -2, value: 2 },
          buildModel(3),
          buildModel(4),
          buildModel(5),
        ],
        payload: buildReplacePayload([-2], [buildModel(2)]),
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
          buildModel(1),
          buildModel(2),
          buildModel(3),
          buildModel(4),
          buildModel(5),
        ],
        payload: buildReplacePayload(
          [6, 7],
          [buildModel(6), buildModel(7)],
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
          buildModel(1),
          buildModel(2),
          buildModel(3),
          buildModel(4),
          buildModel(5),
        ],
        payload: buildPayload(EVENT_TYPES.DELETE, [
          buildModel(2),
          buildModel(4),
        ]),
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
          buildModel(1),
          buildModel(2),
          buildModel(3),
          buildModel(4),
          buildModel(5),
        ],
        payload: buildPayload(EVENT_TYPES.DELETE, [buildModel(6)]),
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
      { originalItems, payload, expectedOrder, expectedCallbackResponse }: any,
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

      it(`should notify callback ${when}`, () => {
        const { fetchSortableDataHandler } = setup({
          originalItems,
        });
        const dataChangeCallback = jest.fn();
        fetchSortableDataHandler.setUpDataChangeCallback(dataChangeCallback);

        fetchSortableDataHandler.onDataChanged(payload);

        expect(dataChangeCallback).toHaveBeenCalledWith(
          expect.objectContaining(expectedCallbackResponse),
        );
      });
    },
  );

  describe('upsert()', () => {
    it('should update', () => {});
  });

  describe('updateEntityStore()', () => {
    function groupTransformFunc(model: Group): ISortableModel {
      return {
        id: model.id,
        sortValue: model.most_recent_post_created_at || 0,
      };
    }

    const group: Group = {
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

      expect(fetchSortableDataHandler.sortableListStore.getIds()).toEqual([
        456,
        123,
      ]);

      newGroup = { ...group, id: 789, most_recent_post_created_at: 1002 };
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [newGroup]);
      expect(fetchSortableDataHandler.sortableListStore.getIds()).toEqual([
        456,
        123,
      ]);
    });
  });
});
