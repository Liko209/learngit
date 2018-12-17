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
  ISortableModel,
  ITransformFunc,
  IMatchFunc,
  ISortFunc,
} from '../types';
import checkListStore from './checkListStore';

import { BaseModel, Group } from 'sdk/models';
import storeManager from '../../../index';
import { ENTITY_NAME } from '@/store';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import GroupModel from '@/store/models/Group';
import { ENTITY, notificationCenter, EVENT_TYPES } from 'sdk/service';
import _ from 'lodash';
import { QUERY_DIRECTION } from 'sdk/dao/constants';

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

function buildNumberSortableModel(data: number) {
  return { data: { id: data }, id: data, sortValue: data };
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

describe('FetchSortableDataListHandler - fetchData', () => {
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
    dataProvider.mockData = { data: [{ id: 1 }, { id: 2 }], hasMore: true };
    fetchSortableDataHandler = new FetchSortableDataListHandler<BaseModel>(
      dataProvider,
      { isMatchFunc, transformFunc, sortFunc, pageSize: 2 },
    );
  });

  it('fetchData', async () => {
    await fetchSortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
    expect(fetchSortableDataHandler.hasMore(QUERY_DIRECTION.OLDER)).toBeFalsy();
    expect(
      fetchSortableDataHandler.hasMore(QUERY_DIRECTION.NEWER),
    ).toBeTruthy();
    checkListStore<ISortableModel>(fetchSortableDataHandler.listStore, [
      buildNumberSortableModel(1),
      buildNumberSortableModel(2),
    ]);
    dataProvider.mockData = { data: [{ id: 3 }], hasMore: false };
    await fetchSortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
    checkListStore<ISortableModel>(fetchSortableDataHandler.listStore, [
      buildNumberSortableModel(1),
      buildNumberSortableModel(2),
      buildNumberSortableModel(3),
    ]);
    expect(fetchSortableDataHandler.hasMore(QUERY_DIRECTION.NEWER)).toBeFalsy();
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

  function handleChangeMap(data: SortableNumber, type: EVENT_TYPES) {
    const changeMap = new Map<number, SortableNumber>();
    changeMap.set(data.id, data);
    const ids = [data.id];

    switch (type) {
      case EVENT_TYPES.UPDATE:
        {
          const notificationBody = {
            ids,
            entities: changeMap,
          };
          const payload = {
            type,
            body: notificationBody,
          };
          fetchSortableDataHandler.onDataChanged(payload);
        }
        break;

      case EVENT_TYPES.DELETE:
        {
          const notificationBody = {
            ids,
          };
          const payload = {
            type,
            body: notificationBody,
          };
          fetchSortableDataHandler.onDataChanged(payload);
        }
        break;
      case EVENT_TYPES.RELOAD:
        {
          const payload = {
            type,
          };
          fetchSortableDataHandler.onDataChanged(payload);
        }
        break;
      case EVENT_TYPES.RESET:
        {
          const payload = {
            type,
          };
          fetchSortableDataHandler.onDataChanged(payload);
        }
        break;
      case EVENT_TYPES.REPLACE:
        {
          const notificationBody = {
            ids,
            entities: changeMap,
            isReplaceAll: false,
          };
          const payload = {
            type,
            body: notificationBody,
          };
          fetchSortableDataHandler.onDataChanged(payload);
        }
        break;
    }
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
    await fetchSortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
  });

  it('update in front', () => {
    handleChangeMap(buildSortableNumber(1), EVENT_TYPES.UPDATE);

    checkListStore(fetchSortableDataHandler.listStore, [
      sortableTransformFunc(buildSortableNumber(1)),
      sortableTransformFunc(buildSortableNumber(3)),
      sortableTransformFunc(buildSortableNumber(6)),
    ]);
  });

  it('update in middle', () => {
    handleChangeMap(buildSortableNumber(4), EVENT_TYPES.UPDATE);
    checkListStore(fetchSortableDataHandler.listStore, [
      sortableTransformFunc(buildSortableNumber(3)),
      sortableTransformFunc(buildSortableNumber(4)),
      sortableTransformFunc(buildSortableNumber(6)),
    ]);
  });

  it('update in tail', () => {
    handleChangeMap(buildSortableNumber(9), EVENT_TYPES.UPDATE);
    checkListStore(fetchSortableDataHandler.listStore, [
      sortableTransformFunc(buildSortableNumber(3)),
      sortableTransformFunc(buildSortableNumber(6)),
    ]);
  });

  it('update with updated sort value', () => {
    handleChangeMap(buildSortableNumber(3, 8), EVENT_TYPES.UPDATE);
    checkListStore(fetchSortableDataHandler.listStore, [
      sortableTransformFunc(buildSortableNumber(6)),
      sortableTransformFunc(buildSortableNumber(3, 8)),
    ]);
  });

  it('update an value from matched to unmatched', async () => {
    isMatchFunc = matchInRange;
    fetchSortableDataHandler = new FetchSortableDataListHandler<SortableNumber>(
      dataProvider,
      { isMatchFunc, transformFunc, sortFunc, pageSize: 2 },
    );
    await fetchSortableDataHandler.fetchData(QUERY_DIRECTION.NEWER);
    handleChangeMap(buildSortableNumber(3, 9), EVENT_TYPES.UPDATE);
    checkListStore(fetchSortableDataHandler.listStore, [
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
    return { id: model.id, sortValue: model.most_recent_post_created_at || 0 };
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
    console.log(JSON.stringify(groupStore.get(group.id)));

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
