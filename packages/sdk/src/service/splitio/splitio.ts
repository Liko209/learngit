/*
 * @Author: steven.zhuang
 * @Date: 2018-11-08 18:45:42
 * Copyright © RingCentral. All rights reserved.
 */

import { SplitIOClient } from './splitioClient';
import { Api } from '../../api';
import notificationCenter from '../../service/notificationCenter';
import { SERVICE } from '../../service/eventKey';
import { mainLogger } from 'foundation';
import { AccountGlobalConfig } from '../../service/account/config';

const LOG_TAG = '[SplitIO]';
const FEATURE_FLAGS = ['Jupiter_telephony', 'Jupiter_version']; // For test

class SplitIO {
  private _clients: {
    [userId: string]: SplitIOClient;
  } = {};

  constructor() {
    this._subscribeExternalEvent();
  }

  public hasCreatedClient(userId: string): boolean {
    return !!this._clients[userId];
  }

  private _subscribeExternalEvent() {
    notificationCenter.on(SERVICE.LOGIN, () => {
      this._onLogin();
    });

    notificationCenter.on(SERVICE.LOGOUT, () => {
      this._onLogout();
    });

    notificationCenter.on(SERVICE.FETCH_INDEX_DATA_DONE, () => {
      this._onIndexDone();
    });
  }

  private _onLogin() {
    mainLogger.info(`${LOG_TAG} onLogin`);
    this._onUserInfoReady();
  }

  private _onLogout() {
    mainLogger.info(`${LOG_TAG} onLogout`);

    Object.keys(this._clients).forEach((userId: string) => {
      const client = this._clients[userId];
      client.shutdown();
      delete this._clients[userId];
    });
  }

  private _onIndexDone() {
    mainLogger.info(`${LOG_TAG} onIndexDone`);
    this._onUserInfoReady();
  }

  private _onUserInfoReady() {
    const userId = this._getCurrentUserId();
    if (!userId) {
      mainLogger.info(`${LOG_TAG} no user id`);
      return;
    }

    const companyId = this._getCurrentCompanyId();
    if (!companyId) {
      mainLogger.info(`${LOG_TAG} no company id`);
      return;
    }

    if (this.hasCreatedClient(userId)) {
      mainLogger.info(`${LOG_TAG} clients for ${userId} already exist`);
      return;
    }

    const attributes = {
      companyId,
    };

    this._clients[userId] = this._createClient(userId, attributes);
  }

  private _getCurrentUserId(): string {
    const userId: number = AccountGlobalConfig.getCurrentUserId();
    return userId ? userId.toString() : '';
  }

  private _getCurrentCompanyId(): string {
    const companyId: number = AccountGlobalConfig.getCurrentCompanyId();
    return companyId ? companyId.toString() : '';
  }

  private _getAuthKey(): string {
    return Api.httpConfig.splitio.clientSecret;
  }

  private _createClient(identity: string, attributes: any): SplitIOClient {
    const authKey = this._getAuthKey();
    return new SplitIOClient(
      authKey,
      identity,
      attributes,
      FEATURE_FLAGS,
      this._onFeatureStatusUpdated.bind(this),
    );
  }

  private _onFeatureStatusUpdated(
    identity: string,
    featureName: string,
    status: string,
  ) {
    mainLogger.info(
      `${LOG_TAG} onFeatureStatusUpdated: [${identity}]${featureName}: ${status}`,
    );
  }
}

export { SplitIO };
