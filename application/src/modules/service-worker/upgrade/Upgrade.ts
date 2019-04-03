/*
 * @Author: steven.zhuang
 * @Date: 2018-11-22 19:22:43
 * Copyright © RingCentral. All rights reserved.
 */

import history from '@/history';
import { mainLogger } from 'sdk';
import { ItemService } from 'sdk/module/item/service';
import { TelephonyService } from 'sdk/module/telephony';

const logTag = '[Upgrade]';
const DEFAULT_UPDATE_INTERVAL = 60 * 60 * 1000;
const ONLINE_UPDATE_THRESHOLD = 20 * 60 * 1000;
const FOREGROUND_RELOAD_THRESHOLD = 60 * 60 * 1000;

class Upgrade {
  private _hasNewVersion: boolean = false;
  private _swURL: string;
  private _lastCheckTime?: Date;
  private _lastRouterChangeTime?: Date;
  private _queryTimer: NodeJS.Timeout;

  constructor(public queryInterval = DEFAULT_UPDATE_INTERVAL) {
    mainLogger.info(
      `${logTag}constructor with interval: ${this.queryInterval}`,
    );

    this._resetQueryTimer();
    window.addEventListener('online', this._onlineHandler.bind(this));
    window.addEventListener('blur', this._blurHandler.bind(this));
    history.listen((location: any, action: string) => {
      if (action === 'PUSH') {
        this._lastRouterChangeTime = new Date();
      }
    });
  }

  public setServiceWorkerURL(swURL: string) {
    mainLogger.info(`${logTag}setServiceWorkerURL: ${swURL}`);
    this._swURL = swURL;
  }

  public onNewContentAvailable() {
    mainLogger.info(`${logTag}New content available`);
    this._hasNewVersion = true;

    if (document.hasFocus()) {
      if (
        this._isTimeOut(FOREGROUND_RELOAD_THRESHOLD, this._lastRouterChangeTime)
      ) {
        this.reloadIfAvailable('Foreground upgrade');
      }
    } else {
      this.reloadIfAvailable('Background upgrade');
    }
  }

  public reloadIfAvailable(triggerSource: string) {
    if (this._hasNewVersion && this._canDoReload()) {
      this._hasNewVersion = false;
      mainLogger.info(
        `${logTag}[${triggerSource}] Will auto reload due to new version is detected`,
      );

      this._reloadApp();
    }
  }

  private _queryIfHasNewVersion() {
    if (!window.navigator.onLine) {
      mainLogger.info(`${logTag}Ignore update due to offline`);
      return;
    }

    if (this._swURL && navigator.serviceWorker) {
      mainLogger.info(`${logTag}Will check new version`);
      navigator.serviceWorker
        .getRegistration(this._swURL)
        .then((registration: ServiceWorkerRegistration) => {
          this._lastCheckTime = new Date();

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

  private _isTimeOut(interval: number, fromDate?: Date) {
    if (!fromDate) {
      return true;
    }

    const now = new Date();
    const duration = now.getTime() - fromDate.getTime();
    return duration > interval;
  }

  private _onlineHandler() {
    if (this._isTimeOut(ONLINE_UPDATE_THRESHOLD, this._lastCheckTime)) {
      this._resetQueryTimer();
      this._queryIfHasNewVersion();
    } else {
      mainLogger.info(`${logTag}Ignore online immediately update`);
    }
  }

  private _blurHandler() {
    this.reloadIfAvailable('Blur upgrade');
  }

  private _resetQueryTimer() {
    if (this._queryTimer) {
      clearInterval(this._queryTimer);
    }

    this._queryTimer = setInterval(
      this._queryIfHasNewVersion.bind(this),
      this.queryInterval,
    );
  }

  private _canDoReload() {
    if (this._hasInProgressCall()) {
      mainLogger.info(`${logTag}Forbidden to reload due to call in progress`);
      return false;
    }

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

    const itemService = ItemService.getInstance() as ItemService;
    if (itemService.hasUploadingFiles()) {
      mainLogger.info(`${logTag}Forbidden to reload due to uploading file`);
      return false;
    }

    // TO-DO in future, disallow reload when there is any meeting.
    return true;
  }

  private _dialogIsPresenting() {
    return document.querySelectorAll('[role=dialog]').length > 0;
  }

  private _editorIsOnFocusAndNotEmpty() {
    if (!document.activeElement) {
      return false;
    }

    return (
      this._hasElementOnFocusAndNotEmpty(
        'input[type="text"]',
        (el: Element) => {
          return !!(el as HTMLInputElement).value;
        },
      ) ||
      this._hasElementOnFocusAndNotEmpty('.ql-editor', (el: Element) => {
        const classList = [].slice.call(el.classList);
        // Have both ql-blank and ql-editor if it is empty
        return classList.length === 1;
      })
    );
  }

  private _hasElementOnFocusAndNotEmpty(
    type: string,
    isNotEmptyCallBack: (el: Element) => boolean,
  ) {
    const allInput = [].slice.call(document.querySelectorAll(type));

    return allInput.some((el: Element) => {
      if (el === document.activeElement) {
        return isNotEmptyCallBack(el);
      }
      return false;
    });
  }

  private _hasInProgressCall() {
    const telephony: TelephonyService = TelephonyService.getInstance();
    return telephony.getAllCallCount() > 0;
  }

  private _reloadApp() {
    window.location.reload();
  }
}

export { Upgrade };
