/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:58:02
 * Copyright © RingCentral. All rights reserved.
 */
import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
} from '../FetchSortableDataListHandler';
import {
  FetchDataDirection,
  ISortableModel,
  ITransformFunc,
  IMatchFunc,
  ISortFunc,
} from '../types';
import checkListStore from './checkListStore';

import { service } from 'sdk';
import { Group } from 'sdk/models';
import storeManager from '../../../index';
import { ENTITY_NAME } from '@/store';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import GroupModel from '@/store/models/Group';
import { ENTITY, GROUP_QUERY_TYPE, notificationCenter } from 'sdk/service';
const { EVENT_TYPES } = service;

class TestFetchSortableDataHandler<T> implements IFetchSortableDataProvider<T> {
  mockData: { data: T[]; hasMore: boolean } = { data: [], hasMore: true };

  fetchData(
    offset: number,
    direction: FetchDataDirection,
    pageSize: number,
    anchor: ISortableModel<T>,
  ): Promise<{ data: T[]; hasMore: boolean }> {
    return Promise.resolve(this.mockData);
  }
}

function buildNumberSortableModel(data: number) {
  return { data, id: data, sortValue: data };
}

function notMatchFunc<T>(arg: T): boolean {
  return false;
}

function matchFunc<T>(arg: T): boolean {
  return true;
}

function numberTransformFunc(data: number): ISortableModel<number> {
  return { data, id: data, sortValue: data as number };
}

describe('FetchSortableDataListHandler - fetchData', () => {
  let fetchSortableDataHandler: FetchSortableDataListHandler<number>;
  let dataProvider: TestFetchSortableDataHandler<number>;
  const transformFunc: ITransformFunc<number> = numberTransformFunc;
  const sortFunc: ISortFunc<any> = (
    first: ISortableModel,
    second: ISortableModel,
  ) => first.sortValue - second.sortValue;

  const isMatchFunc: IMatchFunc<number> = notMatchFunc;

  beforeEach(() => {
    dataProvider = new TestFetchSortableDataHandler();
    dataProvider.mockData = { data: [1, 2], hasMore: true };
    fetchSortableDataHandler = new FetchSortableDataListHandler<number>(
      dataProvider,
      { isMatchFunc, transformFunc, sortFunc, pageSize: 2 },
    );
  });

  it('fetchData', async () => {
    await fetchSortableDataHandler.fetchData(FetchDataDirection.DOWN);
    expect(fetchSortableDataHandler.hasMore(FetchDataDirection.UP)).toBeFalsy();
    expect(
      fetchSortableDataHandler.hasMore(FetchDataDirection.DOWN),
    ).toBeTruthy();
    checkListStore(fetchSortableDataHandler.listStore, [
      buildNumberSortableModel(1),
      buildNumberSortableModel(2),
    ]);
    dataProvider.mockData = { data: [3], hasMore: false };
    await fetchSortableDataHandler.fetchData(FetchDataDirection.DOWN);
    checkListStore(fetchSortableDataHandler.listStore, [
      buildNumberSortableModel(1),
      buildNumberSortableModel(2),
      buildNumberSortableModel(3),
    ]);
    expect(
      fetchSortableDataHandler.hasMore(FetchDataDirection.DOWN),
    ).toBeFalsy();
  });
});

describe('FetchSortableDataListHandler - onDataChange', () => {
  type SortableNumber = {
    id: number;
    sort: number;
  };

  function buildSortableNumber(id: number, sort: number = id): SortableNumber {
    return { id, sort };
  }

  function sortableTransformFunc(model: SortableNumber): ISortableModel {
    return { id: model.id, sortValue: model.sort };
  }

  function matchInRange(target: SortableNumber) {
    return target.sort >= 3 && target.sort <= 8;
  }

  let fetchSortableDataHandler: FetchSortableDataListHandler<SortableNumber>;
  let dataProvider: TestFetchSortableDataHandler<SortableNumber>;

  const transformFunc: ITransformFunc<SortableNumber> = sortableTransformFunc;
  const sortFunc: ISortFunc<any> = (
    first: ISortableModel,
    second: ISortableModel,
  ) => first.sortValue - second.sortValue;

  let isMatchFunc: IMatchFunc<SortableNumber> = matchFunc;

  function handleChangeMap(data: SortableNumber, type: string) {
    const changeMap = new Map<number, SortableNumber>();
    changeMap.set(data.id, data);
    fetchSortableDataHandler.onDataChanged({
      type,
      entities: changeMap,
    });
  }

  beforeEach(async () => {
    dataProvider = new TestFetchSortableDataHandler();
    dataProvider.mockData = {
      data: [buildSortableNumber(3), buildSortableNumber(6)],
      hasMore: true,
    };

    fetchSortableDataHandler = new FetchSortableDataListHandler<SortableNumber>(
      dataProvider,
      { isMatchFunc, transformFunc, sortFunc, pageSize: 2 },
    );
    await fetchSortableDataHandler.fetchData(FetchDataDirection.DOWN);
  });

  it('put in front', () => {
    handleChangeMap(buildSortableNumber(1), EVENT_TYPES.PUT);

    checkListStore(fetchSortableDataHandler.listStore, [
      sortableTransformFunc(buildSortableNumber(1)),
      sortableTransformFunc(buildSortableNumber(3)),
      sortableTransformFunc(buildSortableNumber(6)),
    ]);
  });

  it('put in middle', () => {
    handleChangeMap(buildSortableNumber(4), EVENT_TYPES.PUT);
    checkListStore(fetchSortableDataHandler.listStore, [
      sortableTransformFunc(buildSortableNumber(3)),
      sortableTransformFunc(buildSortableNumber(4)),
      sortableTransformFunc(buildSortableNumber(6)),
    ]);
  });

  it('put in tail', () => {
    handleChangeMap(buildSortableNumber(9), EVENT_TYPES.PUT);
    checkListStore(fetchSortableDataHandler.listStore, [
      sortableTransformFunc(buildSortableNumber(3)),
      sortableTransformFunc(buildSortableNumber(6)),
    ]);
  });

  it('put with updated sort value', () => {
    handleChangeMap(buildSortableNumber(3, 8), EVENT_TYPES.PUT);
    checkListStore(fetchSortableDataHandler.listStore, [
      sortableTransformFunc(buildSortableNumber(6)),
      sortableTransformFunc(buildSortableNumber(3, 8)),
    ]);
  });

  it('put an value from matched to unmatched', async () => {
    isMatchFunc = matchInRange;
    fetchSortableDataHandler = new FetchSortableDataListHandler<SortableNumber>(
      dataProvider,
      { isMatchFunc, transformFunc, sortFunc, pageSize: 2 },
    );
    await fetchSortableDataHandler.fetchData(FetchDataDirection.DOWN);
    handleChangeMap(buildSortableNumber(3, 9), EVENT_TYPES.PUT);
    checkListStore(fetchSortableDataHandler.listStore, [
      sortableTransformFunc(buildSortableNumber(3)),
      sortableTransformFunc(buildSortableNumber(6)),
    ]);
  });

  it('delete an exist data', () => {
    handleChangeMap(buildSortableNumber(3, 8), EVENT_TYPES.DELETE);
    checkListStore(fetchSortableDataHandler.listStore, [
      sortableTransformFunc(buildSortableNumber(6)),
    ]);
  });

  it('delete not exist data', () => {
    handleChangeMap(buildSortableNumber(4), EVENT_TYPES.DELETE);
    checkListStore(fetchSortableDataHandler.listStore, [
      sortableTransformFunc(buildSortableNumber(3)),
      sortableTransformFunc(buildSortableNumber(6)),
    ]);
  });
});

describe('FetchSortableDataListHandler - updateEntityStore', () => {
  function groupTransformFunc(model: Group): ISortableModel {
    return { id: model.id, sortValue: model.most_recent_post_created_at };
  }

  const group: Group = {
    id: 123,
    most_recent_post_created_at: 1000,
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
    await fetchSortableDataHandler.fetchData(FetchDataDirection.DOWN);
  });

  it('should have the group in group store', () => {
    const groupStore = storeManager.getEntityMapStore(
      ENTITY_NAME.GROUP,
    ) as MultiEntityMapStore<Group, GroupModel>;
    expect(groupStore.get(group.id)).toEqual(GroupModel.fromJS(group));
  });

  it('handle the group updated', () => {
    group.most_recent_post_created_at = 1001;
    notificationCenter.emitEntityUpdate(ENTITY.GROUP, [group]);
    const groupStore = storeManager.getEntityMapStore(
      ENTITY_NAME.GROUP,
    ) as MultiEntityMapStore<Group, GroupModel>;
    console.log(JSON.stringify(groupStore.get(group.id)));
    expect(groupStore.get(group.id)).toEqual(GroupModel.fromJS(group));

    let newGroup: Group = { id: 456, most_recent_post_created_at: 99 };
    notificationCenter.emitEntityUpdate(ENTITY.GROUP, [newGroup]);

    expect(fetchSortableDataHandler.sortableListStore.getIds()).toEqual([
      456,
      123,
    ]);

    newGroup = { id: 789, most_recent_post_created_at: 1002 };
    notificationCenter.emitEntityUpdate(ENTITY.GROUP, [newGroup]);
    expect(fetchSortableDataHandler.sortableListStore.getIds()).toEqual([
      456,
      123,
    ]);
  });
});
