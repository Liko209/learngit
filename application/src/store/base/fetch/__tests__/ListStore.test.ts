/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-05 13:53:30
 * Copyright © RingCentral. All rights reserved.
 */
import { ListStore } from '../ListStore';
import { autorun } from 'mobx';
import checkListStore from './checkListStore';

describe('List Store', () => {
  let listStore: ListStore<number>;
  let disposer: Function;

  beforeEach(() => {
    listStore = new ListStore<number>();
    disposer = autorun(() => {});
  });

  afterEach(() => {
    disposer();
  });

  it('Append/Append in front', () => {
    listStore.append([1]);
    expect(listStore.size).toEqual(1);

    listStore.append([2]);
    checkListStore(listStore, [1, 2]);

    listStore.append([3], true);
    checkListStore(listStore, [3, 1, 2]);
  });

  it('replaceAt', () => {
    listStore.append([1, 2, 3]);
    listStore.replaceAt(0, 2);
    checkListStore(listStore, [2, 2, 3]);

    listStore.replaceAll([1, 2]);
    checkListStore(listStore, [1, 2]);
  });

  it('remove', () => {
    listStore.append([1, 2, 3]);
    listStore.remove(1);
    checkListStore(listStore, [2, 3]);
    listStore.removeAt(1);
    checkListStore(listStore, [2]);
  });

  it('clear', () => {
    listStore.append([1, 2, 3]);
    listStore.clear();
    checkListStore(listStore, []);
  });

  it('first/last', () => {
    listStore.append([1, 2, 3]);
    expect(listStore.first()).toEqual(1);
    expect(listStore.last()).toEqual(3);
  });
  it('should return undefined when listStore.length is 0', () => {
    listStore.append([]);
    expect(listStore.first()).toBeUndefined();
    expect(listStore.last()).toBeUndefined();
  });
});
