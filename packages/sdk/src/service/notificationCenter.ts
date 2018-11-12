/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-16 09:47:09
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { EVENT_TYPES } from './constants';
import _ from 'lodash';
import { BaseModel, Raw } from '../models';

type NotificationEntityIds = {
  ids: number[];
};

type NotificationEntityBody<T> = NotificationEntityIds & {
  entities: Map<number, T>;
};

type NotificationEntityUpdateBody<T> = NotificationEntityBody<T> & {
  partials?: Map<number, Partial<Raw<T>>>;
};

// fixed type and body for type binding
type NotificationEntityReplacePayload<T> = {
  type: EVENT_TYPES.REPLACE;
  body: NotificationEntityBody<T>;
};

type NotificationEntityDeletePayload = {
  type: EVENT_TYPES.DELETE;
  body: NotificationEntityIds;
};

type NotificationEntityUpdatePayload<T> = {
  type: EVENT_TYPES.UPDATE;
  body: NotificationEntityUpdateBody<T>;
};

type NotificationEntityResetPayload = {
  type: EVENT_TYPES.RESET | EVENT_TYPES.RELOAD;
};

type NotificationEntityReloadPayload = {
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
const transform2Map = <T extends BaseModel>(entities: T[]): Map<number, T> => {
  const map = new Map<number, T>();
  entities.forEach((item: T) => {
    map.set(item.id, item);
  });
  return map;
};

const transformPartial2Map = <T extends BaseModel>(
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

  emitEntityUpdate<T extends BaseModel>(
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

  emitEntityReplace<T>(key: string, payload: Map<number, T>): void {
    const idsArr = Array.from(payload.keys());

    const notificationBody: NotificationEntityBody<T> = {
      ids: idsArr,
      entities: payload,
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
notificationCenter.setMaxListeners(20);

export { NotificationCenter };
export default notificationCenter;
