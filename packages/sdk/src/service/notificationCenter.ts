/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-16 09:47:09
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { EVENT_TYPES } from './constants';
import _ from 'lodash';
import { BaseModel } from 'sdk/models';

export type NotificationEntityBody<T> = {
  ids?: number[];
  entities?: Map<number, T>;
  partials?: Map<number, T>;
};

export type NotificationEntityPayload<T> = {
  type: EVENT_TYPES;
  body?: NotificationEntityBody<T>;
};

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

class NotificationCenter extends EventEmitter2 {
  constructor() {
    super({ wildcard: true });
  }

  emitEntityUpdate<T extends BaseModel>(
    key: string,
    entities: T[],
    partials?: T[],
  ): void {
    const entityMap = transform2Map(entities);
    const partialMap = partials ? transform2Map(partials) : undefined;
    const ids = Array.from(entityMap.keys());

    const notification = {
      type: EVENT_TYPES.UPDATE,
      body: {
        ids,
        entities: entityMap,
        partials: partialMap,
      },
    };
    this._notifyEntityChange(key, notification);
  }

  emitEntityReplace<T>(key: string, payload: Map<number, T>): void {
    const ids = Array.from(payload.keys());
    const notification = {
      type: EVENT_TYPES.REPLACE,
      body: { ids, entities: payload },
    };

    this._notifyEntityChange(key, notification);
  }

  emitEntityDelete(key: string, ids: number[]): void {
    const notification = {
      type: EVENT_TYPES.DELETE,
      body: { ids },
    };
    this._notifyEntityChange(key, notification);
  }

  emitEntityReset(key: string): void {
    const notification = {
      type: EVENT_TYPES.RESET,
    };
    this._notifyEntityChange(key, notification);
  }

  emitEntityReload(key: string): void {
    const notification = {
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
    notification?: NotificationEntityPayload<T>,
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
