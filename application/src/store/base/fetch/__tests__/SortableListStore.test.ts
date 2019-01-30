/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:19:01
 * Copyright © RingCentral. All rights reserved.
 */
import { SortableListStore } from '../SortableListStore';
import { autorun } from 'mobx';
import checkListStore from './checkListStore';

describe('SortableListStore', () => {
  let listStore: SortableListStore<number>;
  let disposer: Function;

  const preInsertItems = [{ id: 1, sortValue: 1 }, { id: 2, sortValue: 2 }];

  beforeEach(() => {
    listStore = new SortableListStore<number>();
    listStore.upsert(preInsertItems);

    disposer = autorun(() => {});
  });

  afterEach(() => {
    disposer();
  });

  it('upsert', () => {
    checkListStore(listStore, preInsertItems);

    listStore.upsert([{ id: 3, sortValue: 1.5 }]);
    checkListStore(listStore, [
      { id: 1, sortValue: 1 },
      { id: 3, sortValue: 1.5 },
      { id: 2, sortValue: 2 },
    ]);

    listStore.upsert([{ id: 3, sortValue: 3 }]);
    checkListStore(listStore, [
      { id: 1, sortValue: 1 },
      { id: 2, sortValue: 2 },
      { id: 3, sortValue: 3 },
    ]);
  });

  it('removeById', () => {
    listStore.removeByIds([1]);
    checkListStore(listStore, [{ id: 2, sortValue: 2 }]);
  });

  it('getIds', () => {
    expect(listStore.getIds).toEqual([1, 2]);
  });

  it('getById', () => {
    expect(listStore.getById(1)).toEqual({ id: 1, sortValue: 1 });
  });
});
