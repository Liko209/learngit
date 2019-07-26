/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-21 09:44:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Presence, RawPresence } from '../entity';
import { SubscribeController } from './SubscribeController';
import { PRESENCE } from '../constant';
import notificationCenter from '../../../service/notificationCenter';
import { ENTITY } from '../../../service/eventKey';
import { ChangeModel } from '../../sync/types';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';

class PresenceController {
  private _subscribeController: SubscribeController;

  constructor(
    private _cacheController: IEntityCacheController<Presence>,
    threshold: number,
    interval: number,
  ) {
    this._subscribeController = new SubscribeController(
      threshold,
      this.subscribeSuccess.bind(this),
      interval,
    );
  }

  getSubscribeController(): SubscribeController {
    return this._subscribeController;
  }

  updatePresence(presence: Presence): void {
    this._cacheController.put(presence);
  }

  saveToMemory(presences: Presence[]): void {
    presences.forEach((presence: Presence) => {
      this._cacheController.put(presence);
    });
  }

  async getById(id: number): Promise<Presence> {
    const presence = this._getPresenceFromCache(id);
    if (presence) {
      return presence;
    }

    this._subscribeController.appendId(id);
    return {
      id,
      presence: PRESENCE.NOTREADY,
    };
  }

  transform(obj: RawPresence): Presence {
    const presence = obj.calculatedStatus;
    return {
      presence,
      id: obj.personId,
    };
  }

  async handlePresenceIncomingData(
    presences: RawPresence[],
    changeMap?: Map<string, ChangeModel>,
  ) {
    if (presences.length === 0) {
      return;
    }
    const transformedData = ([] as RawPresence[])
      .concat(presences)
      .map(item => this.transform(item)) as Presence[];
    if (changeMap) {
      changeMap.set(ENTITY.PRESENCE, { entities: transformedData });
    } else {
      notificationCenter.emitEntityUpdate(ENTITY.PRESENCE, transformedData);
    }
    this.saveToMemory(transformedData);
  }

  handleSocketStateChange(state: string) {
    if (state === 'connected') {
      this.reset();
      notificationCenter.emitEntityReload(ENTITY.PRESENCE, [], true);
    } else if (state === 'disconnected') {
      this.resetPresence();
    }
  }

  resetPresence() {
    notificationCenter.emitEntityReset(ENTITY.PRESENCE);
  }

  /**
   * Callback for subscribe handler
   * If api return presences need filter presences
   * ensure presence status is latest
   * @param successPresences
   */
  subscribeSuccess(successPresences: RawPresence[]) {
    const needUpdatePresences = successPresences.filter(
      (presence: RawPresence) =>
        !this._cacheController.getSynchronously(presence.personId),
    );
    this.handlePresenceIncomingData(needUpdatePresences);
  }

  unsubscribe(id: number) {
    this._cacheController.delete(id);
    this._subscribeController.removeId(id);
  }

  reset() {
    this._cacheController.clear();
    this._subscribeController.reset();
  }

  private _getPresenceFromCache(id: number) {
    return this._cacheController.getSynchronously(id);
  }
}

export { PresenceController };
