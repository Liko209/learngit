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
import { AccountUserConfig } from '../../../module/account/config';
import { PRESENCE } from '../constant/Presence';

class PresenceService extends EntityBaseService {
  private _presenceController: PresenceController;

  constructor(threshold: number = 29, interval: number = 200) {
    super(false);
    this._presenceController = new PresenceController(threshold, interval);
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.PRESENCE]: this.presenceHandleData,
        [SERVICE.SOCKET_STATE_CHANGE]: this.handleSocketStateChange,
        [SERVICE.STOPPING_SOCKET]: this.resetPresence,
      }),
    );
  }

  saveToMemory(presences: Presence[]): void {
    this._presenceController.saveToMemory(presences);
  }

  async getById(id: number): Promise<Presence> {
    return await this._presenceController.getById(id);
  }

  async getCurrentUserPresence(): Promise<PRESENCE | undefined> {
    const userConfig = new AccountUserConfig();
    const id = userConfig.getGlipUserId();
    const result = await this.getById(id);
    return result.presence;
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

  handleSocketStateChange = ({ state }: { state: string }) => {
    this._presenceController.handleSocketStateChange(state);
  }

  resetPresence = () => {
    this._presenceController.resetPresence();
  }
}

export { PresenceService };
