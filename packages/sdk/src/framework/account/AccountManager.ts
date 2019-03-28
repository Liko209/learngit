/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 14:19:24
 * Copyright © RingCentral. All rights reserved
 */
import { EventEmitter2 } from 'eventemitter2';
import _ from 'lodash';
import { mainLogger, Container } from 'foundation';
import { fetchWhiteList } from './helper';
import { AbstractAccount } from './AbstractAccount';
import { IAccount } from './IAccount';
import { NewGlobalConfig } from '../../service/config/NewGlobalConfig';

import {
  IAccountInfo,
  IAuthenticator,
  IAuthResponse,
  ISyncAuthenticator,
} from './IAuthenticator';

const AUTH_SUCCESS = 'ACCOUNT_MANAGER.AUTH_SUCCESS';
const EVENT_LOGOUT = 'ACCOUNT_MANAGER.EVENT_LOGOUT';
const EVENT_SUPPORTED_SERVICE_CHANGE =
  'ACCOUNT_MANAGER.EVENT_SUPPORTED_SERVICE_CHANGE';

class AccountManager extends EventEmitter2 {
  static AUTH_SUCCESS = AUTH_SUCCESS;
  static EVENT_LOGOUT = EVENT_LOGOUT;
  static EVENT_SUPPORTED_SERVICE_CHANGE = EVENT_SUPPORTED_SERVICE_CHANGE;

  private _isLogin = false;
  private _accountMap: Map<string, IAccount> = new Map();
  private _accounts: IAccount[] = [];

  constructor(private _container: Container) {
    super();
  }

  async syncLogin(authType: string, params?: any) {
    const authenticator = this._container.get<ISyncAuthenticator>(authType);
    const resp = authenticator.authenticate(params);
    return this._handleAuthResponse(resp);
  }

  async login(authType: string, params?: any) {
    const authenticator = this._container.get<IAuthenticator>(authType);
    const resp = await authenticator.authenticate(params);
    if (!resp.accountInfos) {
      throw Error('Auth fail');
    }
    const mailboxID = resp.accountInfos[0].data.owner_id;

    await this.makeSureUserInWhitelist(mailboxID);
    return this._handleAuthResponse(resp);
  }

  async makeSureUserInWhitelist(mailboxID: string) {
    const isValid = await this.sanitizeUser(mailboxID);
    if (!isValid) {
      this.logout();
      mainLogger.warn('[Auth]User not in the white list');
      window.location.href = '/';
    }
  }

  async logout() {
    this._accountMap.clear();
    this._accounts = [];
    this._isLogin = false;
    await this.emitAsync(EVENT_LOGOUT);
  }

  getAccount(type: string): IAccount | null {
    return this._accountMap.get(type) || null;
  }

  hasAccount(type: string): boolean {
    return this._accountMap.has(type);
  }

  isLoggedInFor(type: string): boolean {
    return this.hasAccount(type);
  }

  isLoggedIn(): boolean {
    return this._isLogin;
  }

  updateSupportedServices(data?: any) {
    this._accounts.forEach(account => account.updateSupportedServices(data));
  }

  getSupportedServices(): string[] {
    const servicesArray = this._accounts.map(account =>
      account.getSupportedServices(),
    );
    return _.flatten(servicesArray);
  }

  isSupportedService(type: string) {
    const services = this.getSupportedServices();
    return services.includes(type);
  }

  private _createAccounts(accountInfos: IAccountInfo[]) {
    const accounts = accountInfos.map(({ type }) => {
      const account = this._container.get<IAccount>(type);
      this._accountMap.set(type, account);
      this._accounts.push(account);

      account.on(
        AbstractAccount.EVENT_SUPPORTED_SERVICE_CHANGE,
        (services: string[], isStart: boolean) =>
          this.emit(EVENT_SUPPORTED_SERVICE_CHANGE, services, isStart),
      );

      return account;
    });
    return accounts;
  }

  async sanitizeUser(mailboxID: string) {
    const env = NewGlobalConfig.getEnv();
    const whiteList = await fetchWhiteList();
    const allAccount = whiteList[env];
    if (allAccount !== undefined) {
      const isLegalUser = allAccount.some((account: string) => {
        return account === mailboxID;
      });
      mainLogger.info(
        `[Auth]${mailboxID} ${isLegalUser ? '' : 'not '}in whitelist for ${env}`,
      );
      return isLegalUser;
    }

    mainLogger.info(`[Auth]white list not defined for ${env}`);
    return true;
  }

  private async _handleAuthResponse(resp: IAuthResponse) {
    if (!resp.accountInfos || resp.accountInfos.length <= 0) {
      return { success: false, error: new Error('Auth fail') };
    }
    this.emit(AUTH_SUCCESS, resp.accountInfos);
    this._isLogin = true;
    const accounts = this._createAccounts(resp.accountInfos);
    return {
      accounts,
      success: true,
    };
  }
}

export { AccountManager };
