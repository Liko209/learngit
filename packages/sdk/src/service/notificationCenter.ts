/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-16 09:47:09
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { EVENT_TYPES } from './constants';
import _ from 'lodash';

export type NotificationPayload<T> = {
  type: EVENT_TYPES;
  body?: T;
};

export type NotificationUpdateBody<T> = {
  entities: Map<number, T>;
  partials: Map<number, T> | null;
};

export type NotificationReplaceBody<T> = { id: number; entity: T }[];

export type NotificationDeleteBody = number[];

/**
 * transform array to map structure
 * @param {array} entities
 */
const transform2Map = (entities: any[]): Map<number, any> => {
  const map = new Map();
  entities.forEach((item: any) => {
    map.set(item.id, item);
  });
  return map;
};

class NotificationCenter extends EventEmitter2 {
  constructor() {
    super({ wildcard: true });
  }

  trigger<T>(key: string, notification?: NotificationPayload<T>): void {
    super.emit(key, notification);
  }

  emitEntityUpdate(key: string, entities: any[], partials?: any[]): void {
    const notification = {
      type: EVENT_TYPES.UPDATE,
      body: {
        entities: transform2Map(entities),
        partials: partials ? transform2Map(partials) : null,
      },
    };
    this.trigger(key, notification);
  }

  emitEntityReplace(key: string, entities: { id: any; entity: any }[]): void {
    const notification = {
      type: EVENT_TYPES.REPLACE,
      body: entities,
    };
    this.trigger(key, notification);
  }

  emitEntityDelete(key: string, ids: any[]): void {
    const notification = {
      type: EVENT_TYPES.DELETE,
      body: ids,
    };
    this.trigger(key, notification);
  }

  emitEntityReset(key: string): void {
    const notification = {
      type: EVENT_TYPES.RESET,
    };
    this.trigger(key, notification);
  }

  emitEntityReload(key: string): void {
    const notification = {
      type: EVENT_TYPES.RELOAD,
    };
    this.trigger(key, notification);
  }

  emitKVChange(key: string, value?: any): void {
    if (value) {
      this.trigger(key, value);
    } else {
      this.trigger(key);
    }
  }
}

const notificationCenter: NotificationCenter = new NotificationCenter();
notificationCenter.setMaxListeners(20);

export { NotificationCenter };
export default notificationCenter;
