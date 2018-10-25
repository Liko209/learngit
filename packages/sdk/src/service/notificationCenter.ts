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

  /**
   * emit event for ui layer of store entity update partial data
   * @param {string} key
   * @param {array} entities
   */
  emitEntityUpdate(key: string, entities: any[]): void {
    this.trigger(key, {
      type: EVENT_TYPES.UPDATE,
      entities: transform2Map(entities),
    });
  }

  emitEntityPartialUpdate(key: string, entities: any[]): void {
    this.trigger(key, {
      type: EVENT_TYPES.PARTIAL_UPDATE,
      entities: transform2Map(entities),
    });
  }

  emitEntityReplace(key: string, entities: any[]): void {
    this.trigger(key, {
      type: EVENT_TYPES.REPLACE,
      entities: transform2Map(entities),
    });
  }

  emitEntityReplaceAll(key: string, entities: any[]): void {
    this.trigger(key, {
      type: EVENT_TYPES.REPLACE_ALL,
      entities: transform2Map(entities),
    });
  }

  emitEntityDelete(key: string, entities: any[]): void {
    this.trigger(key, {
      type: EVENT_TYPES.DELETE,
      entities: transform2Map(entities),
    });
  }

  emitEntityReset(key: string, entities: any[]): void {
    this.trigger(key, {
      type: EVENT_TYPES.RESET,
      entities: transform2Map(entities),
    });
  }

  emitEntityReload(key: string, entities: any[]): void {
    this.trigger(key, {
      type: EVENT_TYPES.RELOAD,
      entities: transform2Map(entities),
    });
  }

  emitConfigPut(key: string, payload: any): void {
    this.trigger(key, {
      payload,
      type: EVENT_TYPES.PUT,
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
notificationCenter.setMaxListeners(20);

export { NotificationCenter };
export default notificationCenter;
