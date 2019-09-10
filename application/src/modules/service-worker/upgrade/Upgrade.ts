/*
 * @Author: steven.zhuang
 * @Date: 2018-11-22 19:22:43
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation/log';
import { powerMonitor } from 'foundation/utils';
import { ItemService } from 'sdk/module/item/service';
import { SyncService } from 'sdk/module/sync/service';
import { TelephonyService } from 'sdk/module/telephony';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import _ from 'lodash';

const logTag = '[Upgrade]';
const DEFAULT_UPDATE_INTERVAL = 60 * 60 * 1000;
const ONLINE_UPDATE_THRESHOLD = 20 * 60 * 1000;
const IDLE_THRESHOLD = 50 * 1000;
const BACKGROUND_TIMER_INTERVAL = IDLE_THRESHOLD / 2;
const USER_ACTION_EVENT_DEBOUNCE = 500;

type SWMessageData = {
  type?: string;
  status?: boolean;
  siblingCount?: number;
  reason?: string;
};
class Upgrade {
  private _hasNewVersion: boolean = false;
  private _hasSkippedWaiting: boolean = false;
  private _hasControllerChanged: boolean = false;
  private _refreshing: boolean = false;
  private _swURL: string;
  private _lastCheckUpdateTime?: Date;
  private _lastBackgroundTimerFire?: Date = new Date();
  private _lastUserActionTime?: Date = new Date();
  private _queryTimer: NodeJS.Timeout;

  queryInterval = DEFAULT_UPDATE_INTERVAL;

  constructor() {
    mainLogger.info(
      `${logTag}constructor with interval: ${this.queryInterval}`,
    );

    this._resetQueryTimer();
    setInterval(this._backgroundTimerHandler, BACKGROUND_TIMER_INTERVAL);
    window.addEventListener('online', this._onlineHandler);
    document.addEventListener(
      'mousemove',
      _.debounce(this._mouseMoveHandler, USER_ACTION_EVENT_DEBOUNCE),
    );
    document.addEventListener(
      'keypress',
      _.debounce(this._keyPressHandler, USER_ACTION_EVENT_DEBOUNCE),
    );

    // In case suspend or lock screen for a long time, expected to not reload after unlock screen.
    powerMonitor.onUnlock(() => {
      this._lastUserActionTime = new Date();
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
  }

  public onNewContentAvailable(
    isCurrentPageInControl: boolean,
    isByWaitingWorker: boolean,
  ) {
    mainLogger.info(
      `${logTag}onNewContentAvailable. hasFocus: ${this._appInFocus()}, controller: ${isCurrentPageInControl}, byWaitingWorker: ${isByWaitingWorker}`,
    );

    this._hasNewVersion = true;

    if (!this._appInFocus()) {
      this.skipWaitingIfAvailable('Background upgrade');
    }
  }

  public onControllerChanged() {
    mainLogger.info(`${logTag}onControllerChanged`);

    this._hasControllerChanged = true;

    if (!this._appInFocus()) {
      this.reloadIfAllSiblingAvailable('Background upgrade');
    }
  }

  public onMessageHandler(msgData: string) {
    let data: SWMessageData = {};
    try {
      data = JSON.parse(msgData);
    } catch (err) {
      mainLogger.info(
        `${logTag}onMessageHandler ${data}, parse failed: ${err}`,
      );
    }

    if (data.type === 'siblingCanReload') {
      mainLogger.info(
        `${logTag}[SiblingCanReload]:[${data.siblingCount}] ${data.status} ${
          data.reason ? data.reason : ''
        }`,
      );

      const triggerSource = 'Message';
      if (data.status) {
        this.reloadIfAvailable(triggerSource);
      } else {
        mainLogger.info(
          `${logTag}[${triggerSource}] Forbidden to reload due to sibling in focus`,
        );
      }
    }
  }

  public skipWaitingIfAvailable(triggerSource: string) {
    if (this._hasNewVersion && this._canDoReload(triggerSource)) {
      this._hasNewVersion = false;
      mainLogger.info(
        `${logTag}[${triggerSource}] Will skip waiting due to new version is detected`,
      );

      this._serviceWorkerSkipWaiting();
      this._hasSkippedWaiting = true;
    }
  }

  public reloadIfAllSiblingAvailable(triggerSource: string) {
    if (this._hasControllerChanged) {
      // In some unknown cases, it get the onControllerChange event, even if there's no version get published.
      if (!this._hasSkippedWaiting) {
        mainLogger.info(
          `${logTag}[${triggerSource}] No reload due to has no done skipped waiting`,
        );

        return;
      }

      if (this._hasServiceWorkerController()) {
        this._checkSiblingCanReload();
        return;
      }

      this.reloadIfAvailable(triggerSource);
    }
  }

  public reloadIfAvailable(triggerSource: string) {
    if (this._hasControllerChanged && this._canDoReload(triggerSource)) {
      // In some unknown cases, it get the onControllerChange event, even if there's no version get published.
      if (!this._hasSkippedWaiting) {
        mainLogger.info(
          `${logTag}[${triggerSource}] No reload due to has no done skipped waiting`,
        );

        return;
      }

      this._hasControllerChanged = false;
      mainLogger.info(
        `${logTag}[${triggerSource}] Will auto reload due to service worker controller is changed`,
      );

      this._reloadApp();
    }
  }

  private _queryIfHasNewVersion = async () => {
    if (!window.navigator.onLine) {
      this.logInfo('Ignore update due to offline');
      return;
    }

    const registration = await this._getRegistration('Update');
    this._startServiceWorkerUpdate(registration);
  };

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
    return !!(navigator.serviceWorker && navigator.serviceWorker.controller);
  }

  private _sendMessageToSW(data: Object) {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(data);
    }
  }

  private _checkSiblingCanReload() {
    this.logInfo(`Will check if sibling can reload`);
    this._sendMessageToSW({ type: 'checkSiblingCanReload' });
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
    this._lastCheckUpdateTime = new Date();

    const activeWorker = registration.active;
    const installingWorker = registration.installing;
    const waitingWorker = registration.waiting;
    mainLogger.info(
      `${logTag}active[${!!activeWorker}]${
        activeWorker ? activeWorker.state : ''
      }, installing[${!!installingWorker}]${
        installingWorker ? installingWorker.state : ''
      }, waiting[${!!waitingWorker}]${
        waitingWorker ? waitingWorker.state : ''
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

  private _intervalToNow(fromDate?: Date) {
    const fromTime = fromDate ? fromDate.getTime() : 0;
    const now = new Date();
    return now.getTime() - fromTime;
  }

  private _isTimeOut(interval: number, fromDate?: Date) {
    return this._intervalToNow(fromDate) > interval;
  }

  private _onlineHandler = () => {
    if (this._isTimeOut(ONLINE_UPDATE_THRESHOLD, this._lastCheckUpdateTime)) {
      this._resetQueryTimer();
      this._queryIfHasNewVersion();
    } else {
      mainLogger.info(`${logTag}Ignore online immediately update`);
    }
  };

  private _distanceToLastBackgroundTimerFire() {
    return this._intervalToNow(this._lastBackgroundTimerFire);
  }

  private _isNearToPowerSavingByTimerDetection() {
    return (
      this._distanceToLastBackgroundTimerFire() > BACKGROUND_TIMER_INTERVAL * 3
    );
  }

  private _backgroundTimerHandler = () => {
    if (this._isNearToPowerSavingByTimerDetection()) {
      mainLogger.info(
        `${logTag}Reset user action time due to power saving by timer detection: ${this._distanceToLastBackgroundTimerFire() /
          1000}`,
      );
      // To avoid do refresh when resume computer
      this._lastUserActionTime = new Date();
    }

    this._lastBackgroundTimerFire = new Date();

    this._tryUpgradeIfAvailable('Timer upgrade');
  };

  private _tryUpgradeIfAvailable(triggerSource: string) {
    this.reloadIfAllSiblingAvailable(triggerSource);

    this.skipWaitingIfAvailable(triggerSource);
  }

  private _mouseMoveHandler = () => {
    this._lastUserActionTime = new Date();
  };

  private _keyPressHandler = () => {
    this._lastUserActionTime = new Date();
  };

  private _resetQueryTimer() {
    if (this._queryTimer) {
      clearInterval(this._queryTimer);
    }

    this._queryTimer = setInterval(
      this._queryIfHasNewVersion,
      this.queryInterval,
    );
  }

  private _canDoReload(triggerSource: string) {
    const idleInterval = this._intervalToNow(this._lastUserActionTime);
    if (idleInterval < IDLE_THRESHOLD) {
      mainLogger.info(
        `${logTag}[${triggerSource}] Forbidden to reload due to App is not in idle: ${idleInterval /
          1000}`,
      );
      return false;
    }

    if (this._appInFocus()) {
      mainLogger.info(
        `${logTag}[${triggerSource}] Forbidden to reload due to App is in focus`,
      );
      return false;
    }

    if (this._isInPowerSavingMode()) {
      mainLogger.info(
        `${logTag}[${triggerSource}] Forbidden to reload due to power saving mode`,
      );
      return false;
    }

    if (this._hasInProgressCall()) {
      mainLogger.info(
        `${logTag}[${triggerSource}] Forbidden to reload due to call in progress`,
      );
      return false;
    }

    if (this._isInDataSyncing()) {
      mainLogger.info(
        `${logTag}[${triggerSource}] Forbidden to reload due to data syncing`,
      );
      return false;
    }

    if (this._isInFileUploading()) {
      mainLogger.info(
        `${logTag}[${triggerSource}] Forbidden to reload due to file uploading`,
      );
      return false;
    }

    // TO-DO in future, disallow reload when there is any meeting.
    return true;
  }

  private _hasInProgressCall() {
    const telephony = ServiceLoader.getInstance<TelephonyService>(
      ServiceConfig.TELEPHONY_SERVICE,
    );
    return telephony.getAllCallCount() > 0;
  }

  private _isInDataSyncing() {
    const service = ServiceLoader.getInstance<SyncService>(
      ServiceConfig.SYNC_SERVICE,
    );
    return service.isDataSyncing();
  }

  private _isInFileUploading() {
    const service = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    return service.hasUploadingFiles();
  }

  private _appInFocus() {
    return document.hasFocus();
  }

  private _isInPowerSavingMode() {
    return powerMonitor.isScreenLocked();
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
