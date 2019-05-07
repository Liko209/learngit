/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-15 13:14:39
 * Copyright © RingCentral. All rights reserved.
 */
import storeManager from '../base/StoreManager';
import MultiEntityMapStore from '../base/MultiEntityMapStore';
import SingleEntityMapStore from '../base/SingleEntityMapStore';
import { IdModel, ModelIdType } from 'sdk/framework/model';
import { Entity } from '../store';
import { ENTITY_NAME } from '../constants';
import { GLOBAL_VALUES } from '../config';

function getEntity<
  T extends IdModel<IdType>,
  K extends Entity<IdType>,
  IdType extends ModelIdType = number
>(entityName: ENTITY_NAME, id: IdType) {
  const store = storeManager.getEntityMapStore(
    entityName,
  ) as MultiEntityMapStore<T, K, IdType>;
  return store.get(id) as K;
}

function getSingleEntity<
  T extends IdModel<IdType>,
  K extends Entity<IdType>,
  IdType extends ModelIdType = number
>(entityName: ENTITY_NAME, property: keyof K) {
  const store = storeManager.getEntityMapStore(
    entityName,
  ) as SingleEntityMapStore<T, K, IdType>;
  return store.get(property);
}

function getGlobalValue(key: keyof typeof GLOBAL_VALUES) {
  const store = storeManager.getGlobalStore();
  return store.get(key);
}

function hasValidEntity<
  T extends IdModel<IdType>,
  K extends Entity<IdType>,
  IdType extends ModelIdType = number
>(entityName: ENTITY_NAME, id: IdType) {
  const store = storeManager.getEntityMapStore(
    entityName,
  ) as MultiEntityMapStore<T, K, IdType>;
  return store.hasValid(id);
}

export { hasValidEntity, getEntity, getSingleEntity, getGlobalValue };
