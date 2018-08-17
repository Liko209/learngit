/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-03-01 23:06:10
 * Copyright © RingCentral. All rights reserved.
 */

import MultiEntityMapStore from './MultiEntityMapStore';
import SingleEntityMapStore from './SingleEntityMapStore';
import GlobalStore from './GlobalStore';

import OrderListStore from './OrderListStore';

import { ENTITY_SERVICE, ENTITY_TYPE, HANDLER_TYPE } from './constants';

enum STORE_TYPE {
  UI,
  ENTITY,
  GLOBAL,
}

interface IStores {
  [STORE_TYPE.UI]: Map<string, OrderListStore>;
  [STORE_TYPE.ENTITY]: Map<string, MultiEntityMapStore | SingleEntityMapStore>;
  [STORE_TYPE.GLOBAL]: GlobalStore;
}
class StoreManager {
  private static _instance: StoreManager;
  private stores: IStores;

  private constructor() {
    this.stores = {
      [STORE_TYPE.UI]: new Map(),
      [STORE_TYPE.ENTITY]: new Map(),
      [STORE_TYPE.GLOBAL]: new GlobalStore(),
    };
  }

  public static get Instance() {
    this._instance = this._instance || (this._instance = new this());
    return this._instance;
  }

  injectStores(
    stores: (MultiEntityMapStore | SingleEntityMapStore | OrderListStore)[],
  ) {
    stores.forEach((store) => {
      this.injectStore(store);
    });
  }

  injectStore(
    store: MultiEntityMapStore | SingleEntityMapStore | OrderListStore,
  ) {
    const { name } = store;
    if (store instanceof OrderListStore) {
      this.stores[STORE_TYPE.UI].set(name, store);
    } else {
      this.stores[STORE_TYPE.ENTITY].set(name, store);
    }
  }

  removeStore(
    store: MultiEntityMapStore | SingleEntityMapStore | OrderListStore,
  ) {
    const { name } = store;
    if (store instanceof OrderListStore) {
      this.stores[STORE_TYPE.UI].delete(name);
    } else {
      this.stores[STORE_TYPE.ENTITY].delete(name);
    }
    store.dispose();
  }

  removeStores(
    stores: (MultiEntityMapStore | SingleEntityMapStore | OrderListStore)[],
  ) {
    stores.forEach((store) => {
      this.removeStore(store);
    });
  }

  getStore(type: STORE_TYPE, storeName?: string) {
    if (type !== STORE_TYPE.GLOBAL && storeName) {
      return this.stores[type].get(storeName);
    }
    return this.stores[type];
  }

  getGlobalStore(): GlobalStore {
    return this.getStore(STORE_TYPE.GLOBAL) as GlobalStore;
  }

  getUIStore(storeName: string) {
    return this.getStore(STORE_TYPE.UI, storeName);
  }

  getEntityMapStore(
    entityStoreName: string,
  ): MultiEntityMapStore | SingleEntityMapStore {
    let store = this.getStore(STORE_TYPE.ENTITY, entityStoreName) as
      | MultiEntityMapStore
      | SingleEntityMapStore;
    if (!store) {
      if (ENTITY_TYPE[entityStoreName] === HANDLER_TYPE.MULTI_ENTITY) {
        store = new MultiEntityMapStore(entityStoreName, ENTITY_SERVICE[entityStoreName] as Function
                | [Function, string]);
      } else {
        store = new SingleEntityMapStore(entityStoreName,
                                         ENTITY_SERVICE[entityStoreName] as Function);
      }
      this.injectStore(store);
    }
    return store;
  }

  getAllStore() {
    return this.stores;
  }

  getAllEntityStore() {
    return this.stores[STORE_TYPE.ENTITY];
  }

  dispatchUpdatedDataModels(entityStoreName: string, entities: IEntity[]) {
    const store = this.getEntityMapStore(
      entityStoreName,
    ) as MultiEntityMapStore;
    store.batchSet(entities);
  }
}

export default StoreManager;
