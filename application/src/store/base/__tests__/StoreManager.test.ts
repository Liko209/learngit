/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-07 15:25:08
 * Copyright © RingCentral. All rights reserved.
 */
import storeManager from '../StoreManager';
import MultiEntityMapStore from '../MultiEntityMapStore';
import GlobalStore from '../GlobalStore';
import SingleEntityMapStore from '../SingleEntityMapStore';
import { ENTITY_SETTING } from '../../config';
import { ENTITY_NAME } from '../../constants';

enum STORE_TYPE {
  ENTITY,
  GLOBAL,
}

const multiEntityMapStore = new MultiEntityMapStore(
  ENTITY_NAME.POST,
  ENTITY_SETTING[ENTITY_NAME.POST],
);
const singleEntityMapStore = new SingleEntityMapStore(
  ENTITY_NAME.MY_STATE,
  ENTITY_SETTING[ENTITY_NAME.MY_STATE],
);

describe('StoreManager', () => {
  describe('injectStores()', () => {
    beforeAll(() => {});
    it('injectStore should call 2 times', () => {
      jest.spyOn(storeManager, 'injectStore');
      storeManager.injectStores([singleEntityMapStore, multiEntityMapStore]);
      expect(storeManager.injectStore).toHaveBeenCalledTimes(2);
    });

    it('singleEntityMapStore should be set', () => {
      expect(storeManager.getEntityMapStore(ENTITY_NAME.MY_STATE)).toEqual(
        singleEntityMapStore,
      );
    });

    it('multiEntityMapStore should be set', () => {
      expect(storeManager.getEntityMapStore(ENTITY_NAME.POST)).toEqual(
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
      storeManager.removeStores([singleEntityMapStore, multiEntityMapStore]);
      expect(storeManager.removeStore).toHaveBeenCalledTimes(2);
    });
    it('singleEntityMapStore should be delete', () => {
      expect(
        storeManager.getStore(STORE_TYPE.ENTITY, ENTITY_NAME.MY_STATE),
      ).toBeFalsy();
    });

    it('multiEntityMapStore should be create new entityMapStore', () => {
      expect(
        storeManager.getStore(STORE_TYPE.ENTITY, ENTITY_NAME.POST),
      ).toBeFalsy();
    });
  });

  describe('getAllStore()', () => {
    it('getEntityMapStore should create new entityMapStore', () => {
      expect(storeManager.getEntityMapStore(ENTITY_NAME.PRESENCE)).toEqual(
        storeManager.getStore(STORE_TYPE.ENTITY, ENTITY_NAME.PRESENCE),
      );
    });
    it('getAllStore should return all stores', () => {
      const stores = storeManager.getAllStore();
      expect(Object.keys(stores[STORE_TYPE.ENTITY]).length).toBe(1);
    });
    it('getAllEntityStore should return all entity stores', () => {
      const stores = storeManager.getAllEntityStore();
      expect(Object.keys(stores).length).toBe(1);
      storeManager.getEntityMapStore(ENTITY_NAME.MY_STATE);
      expect(Object.keys(stores).length).toBe(2);
    });
  });

  describe('dispatchUpdatedDataModels', () => {
    it('store batchSet should be call', () => {
      const store = storeManager.getEntityMapStore(ENTITY_NAME.PRESENCE);
      jest.spyOn(store, 'batchSet');
      storeManager.dispatchUpdatedDataModels(ENTITY_NAME.PRESENCE, [
        { id: 111 },
      ]);
      expect(store.batchSet).toHaveBeenCalledWith([{ id: 111 }], true);
    });

    it('it should pass refreshCache parameter to store', () => {
      const store = storeManager.getEntityMapStore(ENTITY_NAME.PRESENCE);
      jest.spyOn(store, 'batchSet');
      storeManager.dispatchUpdatedDataModels(
        ENTITY_NAME.PRESENCE,
        [{ id: 111 }],
        false,
      );
      expect(store.batchSet).toHaveBeenCalledWith([{ id: 111 }], false);
    });
  });
});
