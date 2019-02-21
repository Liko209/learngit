/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-21 09:30:00
 * Copyright © RingCentral. All rights reserved.
 */

import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { SOCKET, SERVICE } from '../../../service/eventKey';
import { Presence, RawPresence } from '../entity';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { PresenceController } from '../controller/PresenceController';

class PresenceService extends EntityBaseService {
  static key = 'PresenceService';
  private _presenceController: PresenceController;

  constructor(threshold: number = 29, interval: number = 200) {
    super(false);
    this._presenceController = new PresenceController(threshold, interval);
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.PRESENCE]: this.presenceHandleData,
        [SERVICE.SOCKET_STATE_CHANGE]: this.handleStore,
      }),
    );
    this.reset();
  }

  saveToMemory(presences: Presence[]): void {
    this._presenceController.saveToMemory(presences);
  }

  async getById(id: number): Promise<Presence> {
    return await this._presenceController.getById(id);
  }

  unsubscribe(id: number) {
    this._presenceController.unsubscribe(id);
  }

  reset() {
    this._presenceController.reset();
  }

  presenceHandleData = async (presences: RawPresence[]) => {
    await this._presenceController.handlePresenceIncomingData(presences);
  }

  handleStore = ({ state }: { state: any }) => {
    this._presenceController.handleStore(state);
  }
}

export { PresenceService };
