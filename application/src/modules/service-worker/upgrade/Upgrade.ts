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

    if (!document.hasFocus()) {
      this.upgradeIfAvailable('Background upgrade');
    }
  }

  public upgradeIfAvailable(triggerSource: string) {
    if (this._hasNewVersion && this._canDoReload()) {
      this._hasNewVersion = false;
      mainLogger.info(
        `${logTag}[${triggerSource}] Will auto reload due to new version is detected`,
      );

      this._reloadApp();
    }
  }

  private _queryIfHasNewVersion() {
    if (this._swURL && navigator.serviceWorker) {
      mainLogger.info(`${logTag}Will check new version`);
      navigator.serviceWorker
        .getRegistration(this._swURL)
        .then((registration: ServiceWorkerRegistration) => {
          registration
            .update()
            .then((...args) => {
              mainLogger.info(
                `${logTag}Check new version done. ${JSON.stringify(args)}`,
              );
            })
            .catch((...args) => {
              mainLogger.warn(
                `${logTag}Check new version failed. ${JSON.stringify(args)}`,
              );
            });
          mainLogger.info(`${logTag}Checking new version`);
        });
    }
  }

  private _canDoReload() {
    if (this._dialogIsPresenting()) {
      mainLogger.info(
        `${logTag}Forbidden to reload due to dialog is presenting`,
      );
      return false;
    }

    if (this._editorIsOnFocusAndNotEmpty()) {
      mainLogger.info(`${logTag}Forbidden to reload due to editor is focused`);
      return false;
    }

    // TO-DO in future, disallow reload when there is any call or meeting.
    return true;
  }

  private _dialogIsPresenting() {
    return document.querySelectorAll('[role=dialog]').length > 0;
  }

  private _editorIsOnFocusAndNotEmpty() {
    if (!document.activeElement) {
      return false;
    }

    const allInputElements = [].slice.call(
      document.querySelectorAll('.ql-editor'),
    );

    return allInputElements.some((el: Element) => {
      if (el === document.activeElement) {
        const classList = [].slice.call(el.classList);
        // Have both ql-blank and ql-editor if it is empty
        return classList.length === 1;
      }
      return false;
    });
  }

  private _reloadApp() {
    window.location.reload();
  }
}

export { Upgrade };
