/*
 * @Author: steven.zhuang
 * @Date: 2018-11-22 19:22:43
 * Copyright © RingCentral. All rights reserved.
 */

import history from '@/history';
import { mainLogger } from 'sdk';
import { ItemService } from 'sdk/module/item/service';
import { TelephonyService } from 'sdk/module/telephony';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

const logTag = '[Upgrade]';
const DEFAULT_UPDATE_INTERVAL = 60 * 60 * 1000;
const ONLINE_UPDATE_THRESHOLD = 20 * 60 * 1000;
const FOREGROUND_RELOAD_THRESHOLD = 60 * 60 * 1000;
const WAITING_WORKER_FLAG = 'upgrade.waiting_worker_flag';

class Upgrade {
  private _hasNewVersion: boolean = false;
  private _hasControllerChanged: boolean = false;
  private _refreshing: boolean = false;
  private _swURL: string;
  private _lastCheckTime?: Date;
  private _lastRouterChangeTime?: Date = new Date();
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

  public logInfo(text: string) {
    mainLogger.info(`${logTag}${text}`);
  }

  public setServiceWorkerURL(swURL: string, hasWaitingWorker: boolean) {
    mainLogger.info(
      `${logTag}setServiceWorkerURL: ${swURL}, hasWaitingWorker: ${hasWaitingWorker}`,
    );
    this._swURL = swURL;

    if (!hasWaitingWorker) {
      this._removeWorkingWorkerFlag();
    }
  }

  public onNewContentAvailable(
    isCurrentPageInControl: boolean,
    isByWaitingWorker: boolean,
  ) {
    mainLogger.info(
      `${logTag}onNewContentAvailable. hasFocus: ${this._appInFocus()}, controller: ${isCurrentPageInControl}, byWaitingWorker: ${isByWaitingWorker}`,
    );
    if (isByWaitingWorker) {
      const workingWorkerFlag = this._getWorkingWorkerFlag();
      if (!!workingWorkerFlag) {
        mainLogger.info(
          `${logTag} Ignore upgrade due to there's waiting worker flag: ${workingWorkerFlag}`,
        );
        return;
      }

      this._setWorkingWorkerFlag();
    }

    this._hasNewVersion = true;

    if (this._appInFocus()) {
      if (
        this._isTimeOut(FOREGROUND_RELOAD_THRESHOLD, this._lastRouterChangeTime)
      ) {
        this.skipWaitingIfAvailable('Foreground upgrade');
      }
    } else {
      this.skipWaitingIfAvailable('Background upgrade');
    }
  }

  public onControllerChanged() {
    mainLogger.info(`${logTag}onControllerChanged`);

    this._hasControllerChanged = true;

    if (this._appInFocus()) {
      if (
        this._isTimeOut(FOREGROUND_RELOAD_THRESHOLD, this._lastRouterChangeTime)
      ) {
        this.reloadIfAvailable('Foreground upgrade');
      }
    } else {
      this.reloadIfAvailable('Background upgrade');
    }
  }

  public skipWaitingIfAvailable(triggerSource: string) {
    if (this._hasNewVersion && this._canDoReload()) {
      this._hasNewVersion = false;
      mainLogger.info(
        `${logTag}[${triggerSource}] Will skip waiting due to new version is detected`,
      );

      this._serviceWorkerSkipWaiting();
    }
  }

  public reloadIfAvailable(triggerSource: string) {
    if (this._hasControllerChanged && this._canDoReload()) {
      this._hasControllerChanged = false;
      mainLogger.info(
        `${logTag}[${triggerSource}] Will auto reload due to service worker controller is changed`,
      );

      this._reloadApp();
    }
  }

  private _getWorkingWorkerFlag() {
    return window.sessionStorage.getItem(WAITING_WORKER_FLAG);
  }
  private _setWorkingWorkerFlag() {
    window.sessionStorage.setItem(
      WAITING_WORKER_FLAG,
      new Date().toISOString(),
    );
  }
  private _removeWorkingWorkerFlag() {
    window.sessionStorage.removeItem(WAITING_WORKER_FLAG);
  }

  private async _queryIfHasNewVersion() {
    if (!window.navigator.onLine) {
      this.logInfo('Ignore update due to offline');
      return;
    }

    const registration = await this._getRegistration('Update');
    this._startServiceWorkerUpdate(registration);
  }

  private async _serviceWorkerSkipWaiting() {
    const registration = await this._getRegistration('Skip Waiting');
    if (!registration) {
      mainLogger.warn(`${logTag}Fail to skip waiting. Invalid registration`);
      return;
    }

    const waiting = registration.waiting;
    const hasController = this._hasServiceWorkerController();
    this.logInfo(
      `Will try skip waiting [${!!waiting}], controller: ${hasController}`,
    );
    waiting && waiting.postMessage({ type: 'SKIP_WAITING' });

    // In case there is no controller, the controllerchange event would not be fired.
    if (!hasController) {
      this._hasControllerChanged = true;
    }
  }

  private _hasServiceWorkerController() {
    return !!navigator.serviceWorker.controller;
  }

  private async _getRegistration(triggerSource: string) {
    if (!this._swURL || !navigator.serviceWorker) {
      this.logInfo(
        `Fail to get registration for ${triggerSource}. _swURL ${!!this
          ._swURL}, ${!!navigator.serviceWorker}`,
      );
      return undefined;
    }

    this.logInfo(`Getting registration for ${triggerSource}`);
    return navigator.serviceWorker.getRegistration(this._swURL);
  }

  private _startServiceWorkerUpdate(registration?: ServiceWorkerRegistration) {
    if (!registration) {
      mainLogger.warn(`${logTag}Fail to start update. Invalid registration`);
      return;
    }
    this._lastCheckTime = new Date();

    const activeWorker = registration.active;
    const installingWorker = registration.installing;
    const waitingWorker = registration.waiting;
    mainLogger.info(
      `${logTag}active[${!!activeWorker}]${
        !!activeWorker ? activeWorker.state : ''
      }, installing[${!!installingWorker}]${
        !!installingWorker ? installingWorker.state : ''
      }, waiting[${!!waitingWorker}]${
        !!waitingWorker ? waitingWorker.state : ''
      }`,
    );

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

    this.skipWaitingIfAvailable('Blur upgrade');
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

    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
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
    const telephony = ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    );
    return telephony.getAllCallCount() > 0;
  }

  private _appInFocus() {
    return document.hasFocus();
  }

  private _reloadApp() {
    // To avoid infinite refresh loop when using the Chrome Dev Tools “Update on Reload” feature.
    if (this._refreshing) {
      mainLogger.info(`${logTag}_reloadApp: refreshing is in progress`);
      return;
    }

    this._refreshing = true;
    window.location.reload();
  }
}

export { Upgrade };
