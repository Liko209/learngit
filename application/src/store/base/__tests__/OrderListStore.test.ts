/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-11 14:34:34
 * Copyright © RingCentral. All rights reserved.
 */
import OrderListStore from '../OrderListStore';
import { IIDSortKey } from '../../store';

const store = new OrderListStore();
let idSortKey1: IIDSortKey;
let idSortKey2: IIDSortKey;
let idSortKey3: IIDSortKey;

describe('OrderListStore', () => {
  describe('set()', () => {
    it('store batchSet should be called', () => {
      idSortKey1 = {
        id: 1,
        sortKey: 2222,
      };
      jest.spyOn(store, 'batchSet');
      store.set(idSortKey1);
      expect(store.batchSet).toHaveBeenCalledWith([idSortKey1]);
    });
  });
  describe('batchSet()', () => {
    beforeAll(() => {
      idSortKey2 = {
        id: 2,
        sortKey: 1111,
      };
      idSortKey3 = {
        id: 3,
        sortKey: 3333,
      };
    });
    it('getIdArray should be get expectIdArray', () => {
      store.batchSet([]);
      expect(store.getIdArray()).toContainEqual(idSortKey1);
      store.batchSet([idSortKey2, idSortKey3]);
      expect(store.getIdArray()).toContainEqual(idSortKey2);
      expect(store.getIdArray()).toContainEqual(idSortKey3);
    });
    it('getIdArray should not be get expectIdArray by sortFunc', () => {
      const expectIdArray = [
        {
          id: 1,
          sortKey: 2222,
        },
        {
          id: 2,
          sortKey: 1111,
        },
        {
          id: 3,
          sortKey: 3333,
        },
      ];
      store.batchSet([idSortKey2, idSortKey3]);
      expect(store.getIdArray()).not.toEqual(expectIdArray);
    });
    it('first()', () => {
      expect(store.first()).toEqual({
        id: 2,
        sortKey: 1111,
      });
    });

    it('last()', () => {
      expect(store.last()).toEqual({
        id: 3,
        sortKey: 3333,
      });
    });
  });

  describe('batchRemove()', () => {
    it('store should have expectIdArray', () => {
      const ids = [1, 2];
      store.batchRemove(ids);
      expect(store.getIdArray()).not.toContainEqual(idSortKey1);
      expect(store.getIdArray()).not.toContainEqual(idSortKey2);
    });
  });
  describe('getIds()', () => {
    it('store should be get specific id', () => {
      expect(store.getIds()).toEqual([3]);
    });
  });
  describe('getSize()', () => {
    it('store should be get idArray length', () => {
      expect(store.getSize()).toEqual(1);
    });
  });
  describe('get()', () => {
    it('store should be get specific idArray by id', () => {
      expect(store.get(3)).toEqual({ id: 3, sortKey: 3333 });
    });
  });
  describe('dump()', () => {
    it('should return dump log', () => {
      jest.spyOn(console, 'log');
      store.dump(1);
      expect(console.log).toHaveBeenCalledWith(
        '===> dump: [{"id":3,"sortKey":3333}]',
        [1],
      );
    });
  });
  describe('clearAll()', () => {
    it('store should be clear', () => {
      store.clearAll();
      expect(store.getIdArray()).toHaveLength(0);
    });
  });
});
