/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-16 09:47:09
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { EVENT_TYPES } from './constants';
import _ from 'lodash';
import { IdModel, Raw, ModelIdType } from '../framework/model';

export type NotificationEntityIds<IdType extends ModelIdType = number> = {
  ids: IdType[];
};

export type NotificationEntityBody<T, IdType extends ModelIdType = number> = NotificationEntityIds<
  IdType
> & {
  entities: Map<IdType, T>;
};

export type NotificationEntityUpdateBody<
  T,
  IdType extends ModelIdType = number
> = NotificationEntityBody<T, IdType> & {
  partials?: Map<IdType, Partial<Raw<T>>>;
};

export type NotificationEntityReplaceBody<
  T,
  IdType extends ModelIdType = number
> = NotificationEntityBody<T, IdType> & {
  isReplaceAll: boolean;
};

// fixed type and body for type binding
export type NotificationEntityReplacePayload<T, IdType extends ModelIdType = number> = {
  type: EVENT_TYPES.REPLACE;
  body: NotificationEntityReplaceBody<T, IdType>;
};

export type NotificationEntityDeletePayload<IdType extends ModelIdType = number> = {
  type: EVENT_TYPES.DELETE;
  body: NotificationEntityIds<IdType>;
};

export type NotificationEntityUpdatePayload<T, IdType extends ModelIdType = number> = {
  type: EVENT_TYPES.UPDATE;
  body: NotificationEntityUpdateBody<T, IdType>;
};

export type NotificationEntityResetPayload = {
  type: EVENT_TYPES.RESET;
};

export type NotificationEntityReloadPayload<IdType extends ModelIdType = number> = {
  type: EVENT_TYPES.RELOAD;
  isReloadAll: boolean;
  body: NotificationEntityIds<IdType>;
};

// unify notification payload
export type NotificationEntityPayload<T, IdType extends ModelIdType = number> =
  | NotificationEntityReplacePayload<T, IdType>
  | NotificationEntityDeletePayload<IdType>
  | NotificationEntityUpdatePayload<T, IdType>
  | NotificationEntityResetPayload
  | NotificationEntityReloadPayload<IdType>;

/**
 * transform array to map structure
 * @param {array} entities
 */
const transform2Map = <T extends IdModel<IdType>, IdType extends ModelIdType = number>(
  entities: T[],
): Map<IdType, T> => {
  const map = new Map<IdType, T>();
  entities.forEach((item: T) => {
    map.set(item.id, item);
  });
  return map;
};

const transformPartial2Map = <T extends IdModel<IdType>, IdType extends ModelIdType = number>(
  entities: Partial<Raw<T>>[],
): Map<IdType, Partial<Raw<T>>> => {
  const map = new Map<IdType, Partial<Raw<T>>>();
  entities.forEach((item: Partial<Raw<T>>) => {
    map.set(item.id ? item.id : item._id ? item._id : 0, item);
  });
  return map;
};

class NotificationCenter extends EventEmitter2 {
  constructor() {
    super({ wildcard: true });
  }

  emitEntityUpdate<T extends IdModel<IdType>, IdType extends ModelIdType = number>(
    key: string,
    entities: T[],
    partials?: Partial<Raw<T>>[],
  ): void {
    const entityMap = transform2Map<T, IdType>(entities);
    const partialMap = partials ? transformPartial2Map<T, IdType>(partials) : undefined;
    const ids = Array.from(entityMap.keys());

    const notificationBody: NotificationEntityUpdateBody<T, IdType> = {
      ids,
      entities: entityMap,
      partials: partialMap,
    };

    const notification: NotificationEntityUpdatePayload<T, IdType> = {
      type: EVENT_TYPES.UPDATE,
      body: notificationBody,
    };
    this._notifyEntityChange(key, notification);
  }

  onEntityUpdate<T extends IdModel<IdType>, IdType extends ModelIdType = number>(
    event: string | string[],
    listener: (payload: NotificationEntityUpdatePayload<T, IdType>) => void,
  ) {
    this.on(event, payload => payload.type === EVENT_TYPES.UPDATE && listener(payload));
  }

  emitEntityReplace<T extends IdModel<IdType>, IdType extends ModelIdType = number>(
    key: string,
    payload: Map<IdType, T>,
    isReplaceAll?: boolean,
  ): void {
    const idsArr = Array.from(payload.keys());

    const notificationBody: NotificationEntityReplaceBody<T, IdType> = {
      ids: idsArr,
      entities: payload,
      isReplaceAll: isReplaceAll ? isReplaceAll : false,
    };

    const notification: NotificationEntityReplacePayload<T, IdType> = {
      type: EVENT_TYPES.REPLACE,
      body: notificationBody,
    };

    this._notifyEntityChange(key, notification);
  }

  onEntityReplace<T extends IdModel<IdType>, IdType extends ModelIdType = number>(
    event: string | string[],
    listener: (payload: NotificationEntityReplacePayload<T, IdType>) => void,
  ) {
    this.on(event, payload => payload.type === EVENT_TYPES.REPLACE && listener(payload));
  }

  emitEntityDelete<IdType extends ModelIdType = number>(key: string, ids: IdType[]): void {
    const notificationBody: NotificationEntityIds<IdType> = {
      ids,
    };

    const notification: NotificationEntityDeletePayload<IdType> = {
      type: EVENT_TYPES.DELETE,
      body: notificationBody,
    };
    this._notifyEntityChange(key, notification);
  }

  onEntityDelete<IdType extends ModelIdType = number>(
    event: string | string[],
    listener: (payload: NotificationEntityDeletePayload<IdType>) => void,
  ) {
    this.on(event, payload => payload.type === EVENT_TYPES.DELETE && listener(payload));
  }

  emitEntityReset(key: string): void {
    const notification: NotificationEntityResetPayload = {
      type: EVENT_TYPES.RESET,
    };
    this._notifyEntityChange(key, notification);
  }

  onEntityReset(
    event: string | string[],
    listener: (payload: NotificationEntityResetPayload) => void,
  ) {
    this.on(event, payload => payload.type === EVENT_TYPES.RESET && listener(payload));
  }

  emitEntityReload<IdType extends ModelIdType = number>(
    key: string,
    ids: IdType[],
    isReloadAll?: boolean,
  ): void {
    const notificationBody: NotificationEntityIds<IdType> = {
      ids,
    };
    const notification: NotificationEntityReloadPayload<IdType> = {
      isReloadAll: isReloadAll ? isReloadAll : false,
      body: notificationBody,
      type: EVENT_TYPES.RELOAD,
    };
    this._notifyEntityChange(key, notification);
  }

  onEntityReload(
    event: string | string[],
    listener: (payload: NotificationEntityReloadPayload) => void,
  ) {
    this.on(event, payload => payload.type === EVENT_TYPES.RELOAD && listener(payload));
  }

  emitKVChange(key: string, value?: any): void {
    if (value) {
      this._trigger(key, value);
    } else {
      this._trigger(key);
    }
  }

  private _notifyEntityChange<T extends IdModel<IdType>, IdType extends ModelIdType = number>(
    key: string,
    notification: NotificationEntityPayload<T, IdType>,
  ): void {
    this._trigger(key, notification);
  }

  private _trigger(key: string, ...args: any[]): void {
    super.emit(key, ...args);
  }
}

const notificationCenter: NotificationCenter = new NotificationCenter();
notificationCenter.setMaxListeners(1000);

export { NotificationCenter };
export default notificationCenter;
