/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-03-11 19:17:03
 * Copyright © RingCentral. All rights reserved.
 */
import { canConnect, CanConnectModel } from '../../api/glip/user';
import { PresenceService } from '../../module/presence/service/PresenceService';
import { PRESENCE } from '../../module/presence/constant/Presence';
import { NewGlobalConfig } from '../config';
import { AccountGlobalConfig } from '../account/config';
import { AuthGlobalConfig } from '../../service/auth/config';
import { mainLogger } from 'foundation';

const NEXT_RECONNECT_TIME = 500;
const MAX_RECONNECT_INTERVAL_TIME = 60 * 1000;

const TAG = '[Socket SocketCanConnectController]';

class SocketCanConnectController {
  private _reconnectIntervalTime = NEXT_RECONNECT_TIME;
  private _canConnectTimeOutId?: NodeJS.Timeout;

  private _managerId: number = 0;
  constructor(id: number) {
    this._managerId = id;
  }

  async doCanConnectApi(callback: (id: number) => void, forceOnline: boolean) {
    this._reconnectIntervalTime = NEXT_RECONNECT_TIME;
    mainLogger.log(TAG, ' start checkCanConnectToServer');
    await this._doCanConnectApi(callback, forceOnline);
  }

  cleanup() {
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
    if (result && result['reconnect_retry_in']) {
      // request success but need to waiting a second
      const time: number = result['reconnect_retry_in'];
      await this._tryToCheckCanConnectAfterTime(callback, forceOnline, time);
    } else {
      callback(this._managerId);
    }
  }

  private _onCanConnectApiFailure(
    e: any,
    callback: (id: number) => void,
    forceOnline: boolean,
  ) {
    mainLogger.log(TAG, ' handleRequestFail:', e);
    this._reconnectIntervalTime = this._reconnectIntervalTime * 2;
    if (this._reconnectIntervalTime >= MAX_RECONNECT_INTERVAL_TIME) {
      this._reconnectIntervalTime = MAX_RECONNECT_INTERVAL_TIME;
    }
    this._tryToCheckCanConnectAfterTime(
      callback,
      forceOnline,
      this._reconnectIntervalTime,
    );
    // may need to handle 401 error to force user logout
  }

  private _tryToCheckCanConnectAfterTime(
    callback: (id: number) => void,
    forceOnline: boolean,
    time: number,
  ) {
    if (!this._canConnectTimeOutId) {
      this._canConnectTimeOutId = setTimeout(() => {
        this._handleReTry.bind(this)(callback, forceOnline);
      },                                     time);
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
    const userId = AccountGlobalConfig.getCurrentUserId();
    const time = NewGlobalConfig.getLastIndexTimestamp();
    const glipAccessToken = AuthGlobalConfig.getGlipToken();
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
    const service: PresenceService = PresenceService.getInstance();
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
}

export { SocketCanConnectController };
