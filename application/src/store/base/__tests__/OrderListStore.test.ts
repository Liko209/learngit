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
  describe('get()', () => {
    it('store should be get specific idArray by id', () => {
      expect(store.get(3)).toEqual({ id: 3, sortKey: 3333 });
    });
  });
});
