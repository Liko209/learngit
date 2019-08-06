/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-22 13:49:26
 * Copyright © RingCentral. All rights reserved.
 */
import { notificationCenter, SERVICE } from 'sdk/service';

abstract class AbstractPermissionController {
  protected isClientReady = false;
  protected isIniting = false;
  constructor() {
    this._subscribeNotifications();
  }

  abstract shutdownClient(shouldClearCache: boolean): void;

  abstract initClient(): void;

  private _subscribeNotifications() {
    notificationCenter.on(SERVICE.GLIP_LOGIN, () => {
      this.initClient();
    });
    notificationCenter.on(SERVICE.FETCH_INDEX_DATA_DONE, () => {
      this.initClient();
    });
    notificationCenter.on(SERVICE.LOGOUT, () => {
      this.shutdownClient(true);
    });
    window.addEventListener('unload', () => {
      this.shutdownClient(false);
    });
  }
}

export { AbstractPermissionController };
