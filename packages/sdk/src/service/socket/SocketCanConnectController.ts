/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-03-11 19:17:03
 * Copyright © RingCentral. All rights reserved.
 */
import { canConnect, CanConnectModel } from 'sdk/api/glip/user';
import { PresenceService } from 'sdk/module/presence/service/PresenceService';
import { PRESENCE } from 'sdk/module/presence/constant/Presence';
import { AccountService } from 'sdk/module/account/service';
import { mainLogger } from 'foundation/log';
import { getSpartaRandomTime } from 'foundation/utils';
import { SyncService } from 'sdk/module/sync/service';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';

const INTERVAL = 3000;

const TAG = '[Socket SocketCanConnectController]';

export type CanReconnectAPIType = {
  interval: number;
  callback: (id: number) => void;
  forceOnline: boolean;
  nthCount: number;
};

class SocketCanConnectController {
  private _canConnectTimeOutId?: NodeJS.Timeout;

  private _managerId: number = 0;
  private _retryCount: number = 0;
  private _isDoingCanConnect: boolean = false;
  constructor(id: number) {
    this._managerId = id;
  }

  async doCanConnectApi(options: CanReconnectAPIType) {
    this._retryCount = 0;
    this._isDoingCanConnect = true;
    const time = this._getStartedTime(options.nthCount, options.interval);
    mainLogger.log(TAG, `start checkCanConnectToServer ${time} later`);
    this._tryToCheckCanConnectAfterTime(
      options.callback,
      options.forceOnline,
      time,
    );
  }

  isDoingCanConnect() {
    return this._isDoingCanConnect;
  }

  cleanup() {
    this._isDoingCanConnect = false;
    this._clearCanConnectTimeOutId();
    mainLogger.log(TAG, 'clean up');
  }

  private async _doCanConnectApi(
    callback: (id: number) => void,
    forceOnline: boolean,
  ) {
    if (!this._windowIsOnLine()) {
      this._onCanConnectApiFailure(
        'not network connected',
        callback,
        forceOnline,
      );
    } else {
      try {
        const result = await this._requestCanConnectInfo(forceOnline);
        this._onCanConnectApiSuccess(callback, result, forceOnline);
      } catch (e) {
        this._onCanConnectApiFailure(e, callback, forceOnline);
      }
    }
  }

  private _windowIsOnLine() {
    return navigator.onLine;
  }

  private async _onCanConnectApiSuccess(
    callback: (id: number) => void,
    result: CanConnectModel,
    forceOnline: boolean,
  ) {
    mainLogger.log(TAG, ' handleRequestSuccess:', result);
    if (typeof result === 'object') {
      if (result && result['reconnect_retry_in']) {
        // request success but need to waiting a second
        const time: number = result['reconnect_retry_in'];
        await this._tryToCheckCanConnectAfterTime(callback, forceOnline, time);
      } else {
        callback(this._managerId);
        this._isDoingCanConnect = false;
      }
    } else {
      this._onCanConnectApiFailure(
        'invalid result type',
        callback,
        forceOnline,
      );
    }
  }

  private _onCanConnectApiFailure(
    e: any,
    callback: (id: number) => void,
    forceOnline: boolean,
  ) {
    this._retryCount = this._retryCount + 1;
    const delayTime = getSpartaRandomTime(this._retryCount, true);
    mainLogger.log(TAG, ' handleRequestFail:', e, ' retry after:', delayTime);
    this._tryToCheckCanConnectAfterTime(callback, forceOnline, delayTime);
    // may need to handle 401 error to force user logout
  }

  private _tryToCheckCanConnectAfterTime(
    callback: (id: number) => void,
    forceOnline: boolean,
    time: number,
  ) {
    if (!this._canConnectTimeOutId) {
      this._canConnectTimeOutId = setTimeout(() => {
        this._handleReTry(callback, forceOnline);
      }, time);
    } else {
      mainLogger.warn(TAG, ' has already exits time out id');
    }
  }

  private _handleReTry(callback: (id: number) => void, forceOnline: boolean) {
    this._clearCanConnectTimeOutId();
    this._doCanConnectApi(callback, forceOnline);
  }

  private _clearCanConnectTimeOutId() {
    this._canConnectTimeOutId && clearTimeout(this._canConnectTimeOutId);
    this._canConnectTimeOutId = undefined;
  }

  private async _requestCanConnectInfo(
    forceOnline: boolean,
  ): Promise<CanConnectModel> {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const userId = userConfig.getGlipUserId();
    const synConfig = ServiceLoader.getInstance<SyncService>(
      ServiceConfig.SYNC_SERVICE,
    ).userConfig;
    const time = synConfig.getLastIndexTimestamp();
    const authConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).authUserConfig;
    const glipAccessToken = authConfig.getGlipToken();
    const params = {
      presence: await this._generateUserPresence(forceOnline),
      uidtk: glipAccessToken,
    };
    if (userId) {
      params['user_id'] = userId;
    }
    if (time) {
      params['newer_than'] = time;
    }
    mainLogger.log(TAG, ' canConnect parameters:', JSON.stringify(params));
    return await canConnect(params);
  }
  private async _generateUserPresence(forceOnline: boolean): Promise<string> {
    if (forceOnline) {
      return 'online';
    }
    const service = ServiceLoader.getInstance<PresenceService>(
      ServiceConfig.PRESENCE_SERVICE,
    );
    let presence;
    try {
      presence = await service.getCurrentUserPresence();
    } catch (e) {
      mainLogger.log(
        TAG,
        ' _generateUserPresence getCurrentUserPresence failed',
      );
    }
    const shouldBeOnline =
      !presence ||
      presence === PRESENCE.AVAILABLE ||
      presence === PRESENCE.NOTREADY;

    return shouldBeOnline ? 'online' : presence || '';
  }

  private _getStartedTime(nthCount: number, interval: number) {
    if (nthCount === 0) {
      return interval > INTERVAL ? 0 : INTERVAL - interval;
    }
    return getSpartaRandomTime(nthCount, true);
  }
}

export { SocketCanConnectController };
