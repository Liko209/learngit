import storeManager from './base/StoreManager';
import MultiEntityMapStore from './base/MultiEntityMapStore';
import SingleEntityMapStore from './base/SingleEntityMapStore';
import { BaseModel } from 'sdk/models';
import { Entity } from './store';
import { ENTITY_NAME } from './constants';
import { GLOBAL_VALUES } from './config';

function getEntity<T extends BaseModel, K extends Entity>(
  entityName: ENTITY_NAME,
  id: number,
) {
  const store = storeManager.getEntityMapStore(
    entityName,
  ) as MultiEntityMapStore<T, K>;
  return store.get(id);
}

function getSingleEntity<T extends BaseModel, K extends Entity>(
  entityName: ENTITY_NAME,
  id: keyof K,
) {
  const store = storeManager.getEntityMapStore(
    entityName,
  ) as SingleEntityMapStore<T, K>;
  return store.get(id);
}

function getGlobalValue(key: keyof typeof GLOBAL_VALUES) {
  const store = storeManager.getGlobalStore();
  return store.get(key);
}

export { getEntity, getSingleEntity, getGlobalValue };
