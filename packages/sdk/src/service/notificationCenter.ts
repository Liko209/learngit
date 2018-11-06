/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-16 09:47:09
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { EVENT_TYPES } from './constants';
import _ from 'lodash';

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
   * emit event for ui layer of store entity update partial data
   * @param {string} key
   * @param {array} entities
   */
  emitEntityUpdate(key: string, entities: any[], partials?: any[]): void {
    this.trigger(key, {
      type: EVENT_TYPES.UPDATE,
      body: {
        entities: transform2Map(entities),
        partials: partials ? transform2Map(partials) : null,
      },
    });
  }

  emitEntityReplace(key: string, entities: { id: any; entity: any }[]): void {
    this.trigger(key, {
      type: EVENT_TYPES.REPLACE,
      body: entities,
    });
  }

  emitEntityDelete(key: string, ids: any[]): void {
    this.trigger(key, {
      type: EVENT_TYPES.DELETE,
      body: ids,
    });
  }

  emitEntityReset(key: string): void {
    this.trigger(key, {
      type: EVENT_TYPES.RESET,
    });
  }

  emitEntityReload(key: string): void {
    this.trigger(key, {
      type: EVENT_TYPES.RELOAD,
    });
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
