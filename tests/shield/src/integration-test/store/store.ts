/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-14 16:20:09
 * Copyright © RingCentral. All rights reserved.
 */
import notificationCenter from 'sdk/service/notificationCenter';
import { ENTITY } from 'sdk/service/eventKey';
import { ENTITY_NAME } from '@/store';
import { IdModel, Raw, ModelIdType } from 'sdk/framework/model';

/**
 * we also has like
 *  ${ENTITY.ITEM}.*.* (class ItemNotification)
 *  or
 *  ${ENTITY.POST}.*
 * so need transform this event key
 * @param entityName
 */
const _getEventKey = function (entityName: ENTITY_NAME) {
  const entityName2EventKey = {
    // [multi store]
    [ENTITY_NAME.GROUP]: ENTITY.GROUP,
    [ENTITY_NAME.GROUP_CONFIG]: ENTITY.GROUP_CONFIG,
    [ENTITY_NAME.PERSON]: ENTITY.PERSON,
    [ENTITY_NAME.GROUP_STATE]: ENTITY.GROUP_STATE,
    [ENTITY_NAME.MY_STATE]: ENTITY.MY_STATE,
    [ENTITY_NAME.ITEM]: `${ENTITY.ITEM}.*.*`,
    [ENTITY_NAME.POST]: `${ENTITY.POST}.*`,
    [ENTITY_NAME.DISCONTINUOUS_POST]: ENTITY.DISCONTINUOUS_POST,
    [ENTITY_NAME.PRESENCE]: ENTITY.PRESENCE,
    [ENTITY_NAME.COMPANY]: ENTITY.COMPANY,
    [ENTITY_NAME.PROFILE]: ENTITY.PROFILE,
    [ENTITY_NAME.PROGRESS]: ENTITY.PROGRESS,
    [ENTITY_NAME.USER_PERMISSION]: ENTITY.USER_PERMISSION,
    [ENTITY_NAME.PHONE_NUMBER]: ENTITY.PHONE_NUMBER,
    // [GLOBAL]
    // [ENTITY_NAME.GROUP]: ENTITY.GROUP,
    // [ENTITY_NAME.GROUP]: ENTITY.GROUP,
    // [ENTITY_NAME.GROUP]: ENTITY.GROUP,
    // unnecessary
    // [ENTITY.POST_OLD_NEW]: ENTITY_NAME.COMPANY,
    // [ENTITY.FOC_RELOAD]: ENTITY_NAME.COMPANY,
  };
  return entityName2EventKey[entityName];
};

class Store {
  update<T extends IdModel<IdType>, IdType extends ModelIdType = number>(
    entityName: ENTITY_NAME,
    entities: T | T[],
    partials?: Partial<Raw<T>> | Partial<Raw<T>>[],
  ) {
    const es = Array.isArray(entities) ? entities : [entities];
    if (partials) {
      const ps = Array.isArray(partials) ? partials : [partials];
      notificationCenter.emitEntityUpdate<T, IdType>(
        _getEventKey(entityName),
        es,
        ps,
      );
    } else {
      notificationCenter.emitEntityUpdate<T, IdType>(
        _getEventKey(entityName),
        es,
      );
    }
  }

  replace<T extends IdModel<IdType>, IdType extends ModelIdType = number>(
    entityName: ENTITY_NAME,
    payload: T | T[],
    isReplaceAll?: boolean,
  ) {
    const pl: Map<IdType, T> = new Map();
    if (Array.isArray(payload)) {
      payload.forEach((item: T) => {
        pl.set(item.id, item);
      });
    } else {
      pl.set(payload.id, payload);
    }

    notificationCenter.emitEntityReplace(
      _getEventKey(entityName),
      pl,
      isReplaceAll,
    );
  }

  // TODO delete reload reset
  // delete<IdType extends ModelIdType = number>(
  //   entityName: ENTITY_NAME,
  //   ids: IdType | IdType[],
  // ) {
  // jest.spyOn(store, 'getByServiceSynchronously').mockReturnValue(null);
  //   notificationCenter.emitEntityDelete(
  //     _getEventKey(entityName),
  //     Array.isArray(ids) ? ids : [ids],
  //   );
  // }

  // reset(entityName: ENTITY_NAME) {
  // jest.spyOn(store, 'getByServiceSynchronously').mockReturnValue(data);
  //   notificationCenter.emitEntityReset(_getEventKey(entityName));
  // }

  // reload(entityName: ENTITY_NAME) {
  // jest.spyOn(store, 'getByServiceSynchronously').mockReturnValue(data);
  //   notificationCenter.emitEntityReload(_getEventKey(entityName));
  // }
}

const store = new Store();

export { store };
