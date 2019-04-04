/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-03-01 23:06:10
 */
// @ts-ignore
import remotedev from 'mobx-remotedev';
import MultiEntityMapStore from './MultiEntityMapStore';
import SingleEntityMapStore from './SingleEntityMapStore';
import GlobalStore from './GlobalStore';

import { HANDLER_TYPE, ENTITY_NAME } from '../constants';
import { ENTITY_SETTING } from '../config';

enum STORE_TYPE {
  ENTITY,
  GLOBAL,
}

interface IStores {
  [STORE_TYPE.ENTITY]: {
    [storeName: string]:
      | MultiEntityMapStore<any, any>
      | SingleEntityMapStore<any, any>;
  };
  [STORE_TYPE.GLOBAL]: GlobalStore;
}
class StoreManager {
  private _stores: IStores;

  constructor() {
    this._init();
  }

  private _init() {
    this._stores = {
      [STORE_TYPE.ENTITY]: {},
      [STORE_TYPE.GLOBAL]: new GlobalStore(),
    };
  }

  injectStores(
    stores: (MultiEntityMapStore<any, any> | SingleEntityMapStore<any, any>)[],
  ) {
    stores.forEach((store: MultiEntityMapStore<any, any>) => {
      this.injectStore(store);
    });
  }

  injectStore(
    store: MultiEntityMapStore<any, any> | SingleEntityMapStore<any, any>,
  ) {
    const { name } = store;
    this._stores[STORE_TYPE.ENTITY][name] = store;
  }

  removeStore(
    store: MultiEntityMapStore<any, any> | SingleEntityMapStore<any, any>,
  ) {
    const { name } = store;
    delete this._stores[STORE_TYPE.ENTITY][name];
    store.dispose();
  }

  removeStores(
    stores: (MultiEntityMapStore<any, any> | SingleEntityMapStore<any, any>)[],
  ) {
    stores.forEach((store: MultiEntityMapStore<any, any>) => {
      this.removeStore(store);
    });
  }

  getStore(type: STORE_TYPE, storeName?: ENTITY_NAME) {
    if (type !== STORE_TYPE.GLOBAL && storeName) {
      return this._stores[type][storeName];
    }
    return this._stores[type];
  }

  getGlobalStore(): GlobalStore {
    return this.getStore(STORE_TYPE.GLOBAL) as GlobalStore;
  }

  getEntityMapStore(entityStoreName: ENTITY_NAME) {
    let store = this.getStore(STORE_TYPE.ENTITY, entityStoreName) as
      | MultiEntityMapStore<any, any>
      | SingleEntityMapStore<any, any>;
    if (!store) {
      if (ENTITY_SETTING[entityStoreName].type === HANDLER_TYPE.MULTI_ENTITY) {
        store = new MultiEntityMapStore(
          entityStoreName,
          ENTITY_SETTING[entityStoreName],
        );
      } else {
        store = new SingleEntityMapStore(
          entityStoreName,
          ENTITY_SETTING[entityStoreName],
        );
      }
      remotedev(store, { name: entityStoreName });
      this.injectStore(store);
    }
    return store;
  }

  getAllStore() {
    return this._stores;
  }

  getAllEntityStore() {
    return this._stores[STORE_TYPE.ENTITY];
  }

  dispatchUpdatedDataModels(
    entityStoreName: ENTITY_NAME,
    entities: any[],
    refreshCache = true,
  ) {
    const store = this.getEntityMapStore(
      entityStoreName,
    ) as MultiEntityMapStore<any, any>;
    store.batchSet(entities, refreshCache);
  }

  dispatchReplacedDataModels(
    entityStoreName: ENTITY_NAME,
    entities: Map<number, any>,
  ) {
    const store = this.getEntityMapStore(
      entityStoreName,
    ) as MultiEntityMapStore<any, any>;
    store.batchReplace(entities);
  }

  resetStores() {
    this._init();
  }
}

export { StoreManager };

export default new StoreManager();
