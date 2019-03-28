/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-16 09:47:09
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { EVENT_TYPES } from './constants';
import _ from 'lodash';
import { IdModel, Raw } from '../framework/model';

export type NotificationEntityIds = {
  ids: number[];
};

export type NotificationEntityBody<T> = NotificationEntityIds & {
  entities: Map<number, T>;
};

export type NotificationEntityUpdateBody<T> = NotificationEntityBody<T> & {
  partials?: Map<number, Partial<Raw<T>>>;
};

type NotificationEntityReplaceBody<T> = NotificationEntityBody<T> & {
  isReplaceAll: boolean;
};

// fixed type and body for type binding
export type NotificationEntityReplacePayload<T> = {
  type: EVENT_TYPES.REPLACE;
  body: NotificationEntityReplaceBody<T>;
};

export type NotificationEntityDeletePayload = {
  type: EVENT_TYPES.DELETE;
  body: NotificationEntityIds;
};

export type NotificationEntityUpdatePayload<T> = {
  type: EVENT_TYPES.UPDATE;
  body: NotificationEntityUpdateBody<T>;
};

export type NotificationEntityResetPayload = {
  type: EVENT_TYPES.RESET;
};

export type NotificationEntityReloadPayload = {
  type: EVENT_TYPES.RELOAD;
};

// unify notification payload
export type NotificationEntityPayload<T> =
  | NotificationEntityReplacePayload<T>
  | NotificationEntityDeletePayload
  | NotificationEntityUpdatePayload<T>
  | NotificationEntityResetPayload
  | NotificationEntityReloadPayload;

/**
 * transform array to map structure
 * @param {array} entities
 */
const transform2Map = <T extends IdModel>(entities: T[]): Map<number, T> => {
  const map = new Map<number, T>();
  entities.forEach((item: T) => {
    map.set(item.id, item);
  });
  return map;
};

const transformPartial2Map = <T extends IdModel>(
  entities: Partial<Raw<T>>[],
): Map<number, Partial<Raw<T>>> => {
  const map = new Map<number, Partial<Raw<T>>>();
  entities.forEach((item: Partial<Raw<T>>) => {
    map.set(item.id ? item.id : item._id ? item._id : 0, item);
  });
  return map;
};

class NotificationCenter extends EventEmitter2 {
  constructor() {
    super({ wildcard: true });
  }

  emitEntityUpdate<T extends IdModel>(
    key: string,
    entities: T[],
    partials?: Partial<Raw<T>>[],
  ): void {
    const entityMap = transform2Map(entities);
    const partialMap = partials ? transformPartial2Map(partials) : undefined;
    const ids = Array.from(entityMap.keys());

    const notificationBody: NotificationEntityUpdateBody<T> = {
      ids,
      entities: entityMap,
      partials: partialMap,
    };

    const notification: NotificationEntityUpdatePayload<T> = {
      type: EVENT_TYPES.UPDATE,
      body: notificationBody,
    };
    this._notifyEntityChange(key, notification);
  }

  emitEntityReplace<T>(
    key: string,
    payload: Map<number, T>,
    isReplaceAll?: boolean,
  ): void {
    const idsArr = Array.from(payload.keys());

    const notificationBody: NotificationEntityReplaceBody<T> = {
      ids: idsArr,
      entities: payload,
      isReplaceAll: isReplaceAll ? isReplaceAll : false,
    };

    const notification: NotificationEntityReplacePayload<T> = {
      type: EVENT_TYPES.REPLACE,
      body: notificationBody,
    };

    this._notifyEntityChange(key, notification);
  }

  emitEntityDelete(key: string, ids: number[]): void {
    const notificationBody: NotificationEntityIds = {
      ids,
    };

    const notification: NotificationEntityDeletePayload = {
      type: EVENT_TYPES.DELETE,
      body: notificationBody,
    };
    this._notifyEntityChange(key, notification);
  }

  emitEntityReset(key: string): void {
    const notification: NotificationEntityResetPayload = {
      type: EVENT_TYPES.RESET,
    };
    this._notifyEntityChange(key, notification);
  }

  emitEntityReload(key: string): void {
    const notification: NotificationEntityReloadPayload = {
      type: EVENT_TYPES.RELOAD,
    };
    this._notifyEntityChange(key, notification);
  }

  emitKVChange(key: string, value?: any): void {
    if (value) {
      this._trigger(key, value);
    } else {
      this._trigger(key);
    }
  }

  private _notifyEntityChange<T>(
    key: string,
    notification: NotificationEntityPayload<T>,
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
