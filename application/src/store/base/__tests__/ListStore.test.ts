/*
 * @Author: Andy Hu
 * @Date: 2018-09-16 13:40:24
 * Copyright © RingCentral. All rights reserved.
 */

import { ListStore } from '../ListStore';
/// <reference path="sdk/__tests__/types.d.ts" />
const store = new ListStore();
const ele = { id: 100, title: '200' };
let elements;
jest.spyOn(store.atom, 'reportChanged');

describe('ListStore', () => {
  beforeEach(() => {
    store.items = [];
    elements = [{ id: 100, title: '200' }, { id: 101, title: '101' }];
  });
  afterEach(() => {
    store.atom.reportChanged.mockClear();
  });
  describe('Append elements to listStore', () => {
    it('Append one element to listStore', () => {
      store.append(ele);
      expect(store.items.slice(-1)[0]).toEqual(ele);
      expect(store.atom.reportChanged).toHaveBeenCalled();
    });

    it('Append several elements to listStore', () => {
      store.append(...elements);
      expect(store.items).toEqual(elements);
      expect(store.atom.reportChanged).toHaveBeenCalled();
    });
  });

  describe('Prepppend elements to listStore', () => {
    it('Prepend one element to listStore', () => {
      store.prepend(ele);
      expect(store.items.slice(0)[0]).toEqual(ele);
      expect(store.atom.reportChanged).toHaveBeenCalled();
    });

    it('Prepend several elements to listStore', () => {
      store.prepend(...elements);
      expect(store.items).toEqual(elements);
      expect(store.atom.reportChanged).toHaveBeenCalled();
    });
  });

  describe('Replace one element in store', () => {
    beforeAll(() => {
      store.items[0] = ele;
    });
    it('should replace one existing element in the store', () => {
      store.replace(0, elements);
      expect(store.items[0]).toEqual(elements);
      expect(store.atom.reportChanged).toHaveBeenCalled();
    });
    it('Should replace all the elments in the store with the given one', () => {
      store.replaceAll(elements);
      expect(store.items).toEqual(elements);
      expect(store.atom.reportChanged).toHaveBeenCalled();
    });
  });
  describe('Delete elements in the store', () => {
    beforeEach(() => {
      store.items = elements;
    });
    it('Should delete the matched items with the given id', () => {
      const predicate = item => {
        return item.id === elements[0].id;
      };
      store.delete(predicate);
      expect(store.items.length).toEqual(1);
      expect(store.atom.reportChanged).toHaveBeenCalled();
    });
  });
  describe('Clear all the elements in the store', () => {
    beforeEach(() => {
      store.items = elements;
    });
    it('The size of the store should be zero', () => {
      store.clearAll();
      expect(store.items.length).toEqual(0);
      expect(store.atom.reportChanged).toHaveBeenCalled();
    });
  });
  it('Get items from the store', () => {
    store.items = elements;
    expect(store.getItems()).toEqual(elements);
  });
  it('Get size of the store', () => {
    store.items = elements;
    expect(store.getSize()).toEqual(elements.length);
  });
  it('Get the first element in the store', () => {
    store.items = elements;
    expect(store.first()).toEqual(elements[0]);
  });
  it('Get the last element in the store', () => {
    store.items = elements;
    expect(store.last()).toEqual(elements.slice(-1)[0]);
  });
  it('should return dump log', () => {
    jest.spyOn(console, 'log');
    store.items = [{ id: 3, sortKey: 3333 }];
    store.dump(1);
    expect(console.log).toHaveBeenCalledWith(
      '===> dump: [{"id":3,"sortKey":3333}]',
      [1],
    );
  });
});
