/*
 * @Author: steven.zhuang
 * @Date: 2018-11-08 18:45:42
 * Copyright © RingCentral. All rights reserved.
 */

import { SplitIOClient } from './splitioClient';
import notificationCenter from '../../service/notificationCenter';
import { SERVICE } from '../../service/eventKey';
import { daoManager, AccountDao } from '../../dao';
import {
  ACCOUNT_USER_ID,
  ACCOUNT_COMPANY_ID,
} from '../../dao/account/constants';
import { mainLogger } from 'foundation';

const LOG_TAG = '[SplitIO]';
const FEATURE_FLAGS = ['Jupiter_telephony', 'Jupiter_version']; // For test

class SplitIO {
  private static instance: SplitIO;
  private _clients: {
    [userId: string]: SplitIOClient;
  } = {};

  constructor() {
    this._subscribeExternalEvent();
  }

  public static getInstance() {
    if (!SplitIO.instance) {
      SplitIO.instance = new SplitIO();
    }

    return SplitIO.instance;
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
    const dao: AccountDao = daoManager.getKVDao(AccountDao);
    const userId: number = dao.get(ACCOUNT_USER_ID);
    if (userId) {
      return userId.toString();
    }

    return '';
  }

  private _getCurrentCompanyId(): string {
    const dao: AccountDao = daoManager.getKVDao(AccountDao);
    const companyId: number = dao.get(ACCOUNT_COMPANY_ID);
    if (companyId) {
      return companyId.toString();
    }

    return '';
  }

  private _getAuthKey(): string {
    // TO-DO: should have a global config to manage all third-party auth keys.
    // return '29hgk2inao6t92k22dubohl2jtf2fdtgsmpn';
    return 'aiers1fdmskm7paalb3ubhhuumaauv21rnti';
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
