/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-07 15:25:08
 * Copyright © RingCentral. All rights reserved.
 */
import StoreManager from '../StoreManager';
import MultiEntityMapStore from '../MultiEntityMapStore';
import GlobalStore from '../GlobalStore';
// import SingleEntityMapStore from '../SingleEntityMapStore';
import OrderListStore from '../OrderListStore';

enum STORE_TYPE {
  UI,
  ENTITY,
  GLOBAL,
}

const storeManager = StoreManager.Instance;
const orderListStore = new OrderListStore('group');
const multiEntityMapStore = new MultiEntityMapStore('post', () => { });
// const singleEntityMapStore = new SingleEntityMapStore('myState', () => {});

describe('StoreManager', () => {
  describe('injectStores()', () => {
    beforeAll(() => { });
    it('injectStore should call 2 times', () => {
      jest.spyOn(storeManager, 'injectStore');
      storeManager.injectStores([orderListStore, multiEntityMapStore]);
      expect(storeManager.injectStore).toHaveBeenCalledTimes(2);
    });
    it('orderListStore should be set', () => {
      expect(storeManager.getUIStore('group')).toEqual(orderListStore);
    });

    it('multiEntityMapStore should be set', () => {
      expect(storeManager.getEntityMapStore('post')).toEqual(
        multiEntityMapStore,
      );
    });

    it('globalStore should be set', () => {
      expect(storeManager.getGlobalStore()).toBeInstanceOf(GlobalStore);
    });
  });
  describe('removeStores()', () => {
    it('removeStores should call 2 times', () => {
      jest.spyOn(storeManager, 'removeStore');
      storeManager.removeStores([orderListStore, multiEntityMapStore]);
      expect(storeManager.removeStore).toHaveBeenCalledTimes(2);
    });
    it('orderListStore should be delete', () => {
      storeManager.removeStore(orderListStore);
      expect(storeManager.getUIStore('group')).toBeFalsy();
    });

    it('multiEntityMapStore should be create new entityMapStore', () => {
      storeManager.removeStore(multiEntityMapStore);
      expect(storeManager.getStore(STORE_TYPE.ENTITY, 'post')).toBeFalsy();
    });
  });

  describe('getAllStore()', () => {
    it('getEntityMapStore should create new entityMapStore', () => {
      expect(storeManager.getEntityMapStore('presence')).toEqual(
        storeManager.getStore(STORE_TYPE.ENTITY, 'presence'),
      );
    });
    it('getAllStore should return all stores', () => {
      storeManager.injectStore(orderListStore);
      const stores = storeManager.getAllStore();
      expect(stores[STORE_TYPE.ENTITY].size).toBe(1);
      expect(stores[STORE_TYPE.UI].size).toBe(1);
    });
    it('getAllEntityStore should return all entity stores', () => {
      const stores = storeManager.getAllEntityStore();
      expect(stores.size).toBe(1);
      storeManager.getEntityMapStore('myState');
      expect(stores.size).toBe(2);
    });
  });

  describe('dispatchUpdatedDataModels', () => {
    it('store batchset should be call', () => {
      const store = storeManager.getEntityMapStore('presence');
      jest.spyOn(store, 'batchSet');
      storeManager.dispatchUpdatedDataModels('presence', [{ id: 111 }]);
      expect(store.batchSet).toHaveBeenCalledWith([{ id: 111 }]);
    });
  });
});
