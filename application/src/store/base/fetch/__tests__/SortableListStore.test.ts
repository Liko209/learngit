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

  const preInsertItems = [
    { id: 1, sortValue: 1 },
    { id: 2, sortValue: 2 },
    { id: 100, sortValue: 100 },
  ];

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
      { id: 100, sortValue: 100 },
    ]);

    listStore.upsert([{ id: 3, sortValue: 3 }]);
    checkListStore(listStore, [
      { id: 1, sortValue: 1 },
      { id: 2, sortValue: 2 },
      { id: 3, sortValue: 3 },
      { id: 100, sortValue: 100 },
    ]);
  });

  it('upsert with more than 11 items and there are same sort value', () => {
    checkListStore(listStore, preInsertItems);

    listStore.upsert([
      { id: 3, sortValue: 3 },
      { id: 4, sortValue: 0 },
      { id: 5, sortValue: 0 },
      { id: 6, sortValue: 0 },
      { id: 7, sortValue: 0 },
      { id: 8, sortValue: 0 },
      { id: 9, sortValue: 0 },
      { id: 10, sortValue: 0 },
      { id: 11, sortValue: 0 },
      { id: 12, sortValue: 0 },
      { id: 13, sortValue: 0 },
      { id: 14, sortValue: 4 },
      { id: 15, sortValue: 0 },
      { id: 16, sortValue: 1 },
      { id: 17, sortValue: 100 },
    ]);
    checkListStore(listStore, [
      { id: 4, sortValue: 0 },
      { id: 5, sortValue: 0 },
      { id: 6, sortValue: 0 },
      { id: 7, sortValue: 0 },
      { id: 8, sortValue: 0 },
      { id: 9, sortValue: 0 },
      { id: 10, sortValue: 0 },
      { id: 11, sortValue: 0 },
      { id: 12, sortValue: 0 },
      { id: 13, sortValue: 0 },
      { id: 15, sortValue: 0 },
      { id: 16, sortValue: 1 },
      { id: 1, sortValue: 1 },
      { id: 2, sortValue: 2 },
      { id: 3, sortValue: 3 },
      { id: 14, sortValue: 4 },
      { id: 17, sortValue: 100 },
      { id: 100, sortValue: 100 },
    ]);
  });

  it('removeById', () => {
    listStore.removeByIds([1]);
    checkListStore(listStore, [
      { id: 2, sortValue: 2 },
      { id: 100, sortValue: 100 },
    ]);
  });

  it('getIds', () => {
    expect(listStore.getIds).toEqual([1, 2, 100]);
  });

  it('getById', () => {
    expect(listStore.getById(1)).toEqual({ id: 1, sortValue: 1 });
  });
});
