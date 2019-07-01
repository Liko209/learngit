/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 10:26:41
 * Copyright © RingCentral. All rights reserved.
 */

import { EntityBaseService } from '../../../framework/service';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { HealthModuleController } from '../../../framework/controller/impl/HealthModuleController';
import { SERVICE, SOCKET, WINDOW } from '../../../service/eventKey';
import { SyncListener } from './SyncListener';
import { SyncController } from '../controller/SyncController';
import { IdModel } from '../../../framework/model';
import { SyncUserConfig } from '../config/SyncUserConfig';
import { MODULE_IDENTIFY, MODULE_NAME } from '../constant';
import { UndefinedAble } from 'sdk/types';
import { UserConfig } from 'sdk/module/config';

class SyncService extends EntityBaseService<IdModel> {
  private _syncController: SyncController;
  private _userConfig: SyncUserConfig;

  constructor() {
    super({ isSupportedCache: false });
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SERVICE.SOCKET_STATE_CHANGE]: this.handleSocketConnectionStateChanged.bind(
          this,
        ),
        [SOCKET.TIMESTAMP]: this.updateIndexTimestamp.bind(this),
        [SERVICE.STOPPING_SOCKET]: this._handleStoppingSocketEvent.bind(this),
        [SERVICE.WAKE_UP_FROM_SLEEP]: this._handleWakeUpFromSleep.bind(this),
        [WINDOW.FOCUS]: this._handleWindowFocused.bind(this),
      }),
    );
    this.setHealthModuleController(
      new HealthModuleController(MODULE_IDENTIFY, MODULE_NAME, {
        SyncStatus: () => ({
          lastIndexStatus: this._userConfig.getIndexSucceed()
            ? 'success'
            : 'failed',
          lastIndexTimestamp: this.getSyncController().getIndexTimestamp(),
        }),
      }),
    );
  }

  get userConfig() {
    if (!this._userConfig) {
      this._userConfig = new SyncUserConfig();
    }
    return this._userConfig;
  }

  getUserConfig(): UndefinedAble<UserConfig> {
    return this.userConfig;
  }

  updateIndexTimestamp(time: number) {
    this.getSyncController().updateIndexTimestamp(time, false);
  }

  getIndexTimestamp() {
    return this.getSyncController().getIndexTimestamp();
  }

  async syncData(syncListener?: SyncListener) {
    await this.getSyncController().syncData(syncListener);
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

  private _handleWakeUpFromSleep() {
    this.getSyncController().handleWakeUpFromSleep();
  }

  private _handleWindowFocused() {
    this.getSyncController().handleWindowFocused();
  }
}

export { SyncService };
