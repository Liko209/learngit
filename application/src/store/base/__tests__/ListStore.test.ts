import ListStore from '@/store/base/ListStore';
import { autorun } from 'mobx';
import { number } from '@storybook/addon-knobs/react';
/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-05 13:53:30
 * Copyright © RingCentral. All rights reserved.
 */

const _checkListItems = (
  listStore: ListStore<number>,
  expectData: number[],
) => {
  expect(listStore.getItems()).toEqual(expectData);
};

describe('List Store', () => {
  let listStore: ListStore<number>;
  let disposer: Function;

  beforeEach(() => {
    listStore = new ListStore<number>();
    disposer = autorun(() => {
      console.log(`========> ${listStore.getItems()}`);
    });
  });

  afterEach(() => {
    disposer();
  });

  it('Append/Append in front', () => {
    listStore.append([1]);
    expect(listStore.getSize()).toEqual(1);

    listStore.append([2]);
    _checkListItems(listStore, [1, 2]);

    listStore.append([3], true);
    _checkListItems(listStore, [3, 1, 2]);
  });

  it('replaceAt', () => {
    listStore.append([1, 2, 3]);
    listStore.replaceAt(0, 2);
    _checkListItems(listStore, [2, 2, 3]);

    listStore.replaceAll([1, 2]);
    _checkListItems(listStore, [1, 2]);
  });

  it('remove', () => {
    listStore.append([1, 2, 3]);
    listStore.remove(1);
    _checkListItems(listStore, [2, 3]);
    listStore.removeAt(1);
    _checkListItems(listStore, [2]);
  });

  it('clear', () => {
    listStore.append([1, 2, 3]);
    listStore.clear();
    _checkListItems(listStore, []);
  });

  it('first/last', () => {
    listStore.append([1, 2, 3]);
    expect(listStore.first()).toEqual(1);
    expect(listStore.last()).toEqual(3);
  });
});
