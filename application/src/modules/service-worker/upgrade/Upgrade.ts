/*
 * @Author: steven.zhuang
 * @Date: 2018-11-22 19:22:43
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'sdk';
const logTag = '[Upgrade]';

class Upgrade {
  private _hasNewVersion: boolean = false;
  private _swURL: string;

  constructor(public queryInterval = 20 * 60 * 1000) {
    mainLogger.info(
      `${logTag}constructor with interval: ${this.queryInterval}`,
    );
    setInterval(this._queryIfHasNewVersion.bind(this), this.queryInterval);
  }

  public setServiceWorkerURL(swURL: string) {
    mainLogger.info(`${logTag}setServiceWorkerURL: ${swURL}`);
    this._swURL = swURL;
  }

  public onNewContentAvailable() {
    mainLogger.info(`${logTag}New content available`);
    this._hasNewVersion = true;
  }

  public upgradeIfAvailable() {
    if (this._hasNewVersion && this._canDoReload()) {
      mainLogger.info(
        `${logTag}Will auto reload due to new version is detected`,
      );

      this._reloadApp();
    }
  }

  private _queryIfHasNewVersion() {
    if (this._swURL && navigator.serviceWorker) {
      mainLogger.info(`${logTag}Checking new version`);
      navigator.serviceWorker
        .getRegistration(this._swURL)
        .then((registration: ServiceWorkerRegistration) => {
          registration.update();
        });
    }
  }

  private _canDoReload() {
    // TO-DO in future, disallow reload when there is any call or meeting.
    return true;
  }

  private _reloadApp() {
    window.location.reload();
  }
}

export { Upgrade };
