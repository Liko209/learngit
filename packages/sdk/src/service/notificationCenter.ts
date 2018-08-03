/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-16 09:47:09
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { EVENT_TYPES } from './constants';

// interface Item {
//   id: number;
// }

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

  trigger(key: string, ...args: any[]): void {
    // mainLogger.debug(...args);
    super.emit(key, ...args);
  }

  /**
   * emit event for ui layer of store entity insert or update
   * @param {string} key
   * @param {array} entities
   */
  emitEntityPut(key: string, entities: any[]): void {
    this.trigger(key, {
      type: EVENT_TYPES.PUT,
      entities: transform2Map(entities),
    });
  }

  emitEntityUpdate(key: string, entities: any[]): void {
    this.trigger(key, {
      type: EVENT_TYPES.UPDATE,
      entities: transform2Map(entities),
    });
  }

  emitEntityReplace(key: string, entities: any[]): void {
    this.trigger(key, {
      type: EVENT_TYPES.REPLACE,
      entities: transform2Map(entities),
    });
  }

  emitEntityDelete(key: string, entities: any[]): void {
    this.trigger(key, {
      type: EVENT_TYPES.DELETE,
      entities: transform2Map(entities),
    });
  }

  emitConfigPut(key: string, payload: any): void {
    this.trigger(key, {
      type: EVENT_TYPES.PUT,
      payload,
    });
  }

  emitConfigDelete(key: string): void {
    this.trigger(key, {
      type: EVENT_TYPES.DELETE,
    });
  }

  emitService(key: string, payload?: any): void {
    this.trigger(key, payload);
  }
}

const notificationCenter: NotificationCenter = new NotificationCenter();

export { NotificationCenter };
export default notificationCenter;
