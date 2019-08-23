/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-25 13:42:44
 * Copyright © RingCentral. All rights reserved.
 */
import storeManager from '@/store/base/StoreManager';
import SingleEntityMapStore from '@/store/base/SingleEntityMapStore';
// import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import { ENTITY_NAME, ENTITY_SETTING } from '@/store';
import { Entity } from '@/store/store';
import { IdModel } from 'sdk/framework/model';
import { HANDLER_TYPE } from '@/store/constants';
import { descriptorAOP } from '../core/utils';

afterEach(() => {
  storeManager.resetStores();
});

const _isSingleStore = function(entityName: ENTITY_NAME) {
  return ENTITY_SETTING[entityName].type === HANDLER_TYPE.SINGLE_ENTITY;
};

function mockStoreSet<T extends IdModel, K extends Entity>(
  entityName: ENTITY_NAME,
  data: any,
) {
  return function(
    target: any,
    property: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFn = descriptor.value;

    const _storeSet = () => {
      const store = storeManager.getEntityMapStore(entityName);
      if (_isSingleStore(entityName)) {
        (store as SingleEntityMapStore<T, K>).batchSet(data);
      } else {
        jest.spyOn(store, 'getByServiceSynchronously').mockReturnValue(data);
        // (store as MultiEntityMapStore<T, K>).set(data, false);
      }
    };

    descriptor.value = descriptorAOP(target, _storeSet, oldFn);
    return descriptor;
  };
}

export { mockStoreSet };
