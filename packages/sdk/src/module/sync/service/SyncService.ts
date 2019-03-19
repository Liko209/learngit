/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 10:26:41
 * Copyright © RingCentral. All rights reserved.
 */

import { EntityBaseService } from '../../../framework/service';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { SERVICE, SOCKET } from '../../../service/eventKey';
import { SyncListener } from './SyncListener';
import { SyncController } from '../controller/SyncController';

class SyncService extends EntityBaseService {
  private _syncController: SyncController;
  constructor() {
    super(false);
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SERVICE.SOCKET_STATE_CHANGE]: this.handleSocketConnectionStateChanged.bind(
          this,
        ),
        [SOCKET.TIMESTAMP]: this.updateIndexTimestamp.bind(this),
        [SERVICE.STOPPING_SOCKET]: this._handleStoppingSocketEvent.bind(this),
      }),
    );
  }

  updateIndexTimestamp(time: number) {
    this.getSyncController().updateIndexTimestamp(time, false);
  }

  getIndexTimestamp() {
    return this.getSyncController().getIndexTimestamp();
  }

  async syncData(syncListener?: SyncListener) {
    this.getSyncController().syncData(syncListener);
  }

  handleSocketConnectionStateChanged({ state }: { state: any }) {
    this.getSyncController().handleSocketConnectionStateChanged({ state });
  }

  protected getSyncController() {
    if (!this._syncController) {
      this._syncController = new SyncController();
    }
    return this._syncController;
  }

  private _handleStoppingSocketEvent() {
    this.getSyncController().handleStoppingSocketEvent();
  }
}

export { SyncService };
