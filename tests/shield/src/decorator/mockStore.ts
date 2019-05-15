/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-25 13:42:44
 * Copyright © RingCentral. All rights reserved.
 */
import storeManager from '@/store/base/StoreManager';
import SingleEntityMapStore from '@/store/base/SingleEntityMapStore';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
// import notificationCenter from 'sdk/service/notificationCenter';
// import { ENTITY } from 'sdk/service/eventKey';
import { ENTITY_NAME, ENTITY_SETTING } from '@/store';
import { Entity } from '@/store/store';
import { IdModel } from 'sdk/framework/model';
import { HANDLER_TYPE } from '@/store/constants';
import { descriptorAOP } from './utils';

/**
 *  TODO
 * we also has like
 *  ${ENTITY.ITEM}.*.* (class ItemNotification)
 *  or
 *  ${ENTITY.POST}.*
 * so need transform this event key
 * @param entityName
 * const _getEventKey = function (entityName: ENTITY_NAME) {
  const entityName2EventKey = {
    [ENTITY_NAME.GROUP]: ENTITY.GROUP,
    [ENTITY_NAME.GROUP_CONFIG]: ENTITY.GROUP_CONFIG,
    [ENTITY_NAME.PERSON]: ENTITY.PERSON,
    [ENTITY_NAME.GROUP_STATE]: ENTITY.GROUP_STATE,
    [ENTITY_NAME.MY_STATE]: ENTITY.MY_STATE,
    [ENTITY_NAME.ITEM]: ENTITY.ITEM,
    [ENTITY_NAME.POST]: ENTITY.POST,
    [ENTITY_NAME.DISCONTINUOUS_POST]: ENTITY.DISCONTINUOUS_POST,
    [ENTITY_NAME.PRESENCE]: ENTITY.PRESENCE,
    [ENTITY_NAME.COMPANY]: ENTITY.COMPANY,
    [ENTITY_NAME.PROFILE]: ENTITY.PROFILE,
    [ENTITY_NAME.PROGRESS]: ENTITY.PROGRESS,
    [ENTITY_NAME.USER_PERMISSION]: ENTITY.USER_PERMISSION,
    // [GLOBAL]
    [ENTITY_NAME.GROUP]: ENTITY.GROUP,
    [ENTITY_NAME.GROUP]: ENTITY.GROUP,
    [ENTITY_NAME.GROUP]: ENTITY.GROUP,
    // unnecessary
    // [ENTITY.POST_OLD_NEW]: ENTITY_NAME.COMPANY,
    // [ENTITY.FOC_RELOAD]: ENTITY_NAME.COMPANY,
  };
  return entityName2EventKey[entityName];
};
 */

afterEach(() => {
  storeManager.resetStores();
});

const _isSingleStore = function (entityName: ENTITY_NAME) {
  return ENTITY_SETTING[entityName].type === HANDLER_TYPE.SINGLE_ENTITY;
};

function mockStoreSet<T extends IdModel, K extends Entity>(
  entityName: ENTITY_NAME,
  data: any,
) {
  return function (
    target: any,
    property: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFn = descriptor.value;
    const hasParam = oldFn.length > 0;
    /**
     * TODO
      Cannot implement mock store from notification
      because of we not has entitySet event yet
      if we use replace or update also cannot set data into store
     */
    // const payload = new Map();
    // payload.set(2222, { id: 2222, unread_count: 123456 });
    // notificationCenter.emitEntityUpdate(_getEventKey(entityName), [
    //   { id: 2222, unread_count: 123456 },
    // ]);
    const _storeSet = () => {
      const store = storeManager.getEntityMapStore(entityName);
      if (_isSingleStore(entityName)) {
        (store as SingleEntityMapStore<T, K>).batchSet(data);
      } else {
        (store as MultiEntityMapStore<T, K>).set(data, false);
      }
    };

    descriptor.value = descriptorAOP(hasParam, _storeSet, oldFn);
    return descriptor;
  };
}

export { mockStoreSet };
