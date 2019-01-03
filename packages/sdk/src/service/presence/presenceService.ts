/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 13:23:12
 * Copyright © RingCentral. All rights reserved.
 */

import BaseService from '../../service/BaseService';
import { presenceHandleData, handleStore } from './handleData';
import { SOCKET, SERVICE } from '../eventKey';
import { Presence, RawPresence } from '../../module/presence/entity';
import SubscribeHandler from './subscribeHandler';
import { PRESENCE } from '../constants';

class PresenceService extends BaseService {
  static key = 'PresenceService';

  public caches: Map<number, Presence>; // <id, RawPresence['calculatedStatus']>
  public subscribeHandler: SubscribeHandler;
  constructor(threshold: number = 29, interval: number = 200) {
    // channel presence_unified threshold interval
    const subscriptions = {
      [SOCKET.PRESENCE]: presenceHandleData,
      [SERVICE.SOCKET_STATE_CHANGE]: handleStore,
    };
    super(null, null, null, subscriptions);
    this.subscribeHandler = new SubscribeHandler(
      threshold,
      this.subscribeSuccess.bind(this),
      interval,
    );
    // when serviceManager's property "instances" is recycled, it will be destroyed.
    this.reset();
  }

  private _getPresenceFromCache(id: number) {
    return this.caches.get(id);
  }

  saveToMemory(presences: Presence[]): void {
    presences.forEach((presence: Presence) => {
      this.caches.set(presence.id, presence);
    });
  }

  async getById(id: number): Promise<Presence> {
    const presence = this._getPresenceFromCache(id);
    if (presence) {
      return presence;
    }

    this.subscribeHandler.appendId(id);
    return {
      id,
      presence: PRESENCE.NOTREADY,
    };
  }

  /**
   * Callback for subscribe handler
   * If api return presences need filter presences
   * ensure presence status is latest
   * @param successPresences
   */
  subscribeSuccess(successPresences: RawPresence[]) {
    const needUpdatePresences = successPresences.filter(
      (presence: RawPresence) => !this.caches.has(presence.personId),
    );
    presenceHandleData(needUpdatePresences);
  }

  unsubscribe(id: number) {
    this.caches.delete(id);
    this.subscribeHandler.removeId(id);
  }

  reset() {
    this.caches = new Map();
    this.subscribeHandler.reset();
  }
}

export { PresenceService };
