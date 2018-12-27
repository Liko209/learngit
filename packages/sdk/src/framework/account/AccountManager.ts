/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 14:19:24
 * Copyright © RingCentral. All rights reserved
 */
import { EventEmitter2 } from 'eventemitter2';
import _ from 'lodash';
import { Container } from 'foundation';
import { fetchWhiteList } from './helper';
import { AbstractAccount } from './AbstractAccount';
import { IAccount } from './IAccount';
import { daoManager, ConfigDao } from '../../dao';

import {
  IAccountInfo,
  IAuthenticator,
  IAuthResponse,
  ISyncAuthenticator,
} from './IAuthenticator';

const EVENT_LOGIN = 'ACCOUNT_MANAGER.EVENT_LOGIN';
const EVENT_LOGOUT = 'ACCOUNT_MANAGER.EVENT_LOGOUT';
const EVENT_SUPPORTED_SERVICE_CHANGE =
  'ACCOUNT_MANAGER.EVENT_SUPPORTED_SERVICE_CHANGE';

class AccountManager extends EventEmitter2 {
  static EVENT_LOGIN = EVENT_LOGIN;
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
    return this._handleLoginResponse(resp);
  }

  async login(authType: string, params?: any) {
    const authenticator = this._container.get<IAuthenticator>(authType);
    const resp = await authenticator.authenticate(params);
    return this._handleLoginResponse(resp);
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

  async sanitizeUser(account: IAccountInfo[]) {
    const configDao = daoManager.getKVDao(ConfigDao);
    const env = configDao.getEnv();
    const whiteList = await fetchWhiteList();
    if (Object.keys(whiteList).includes(env)) {
      const isLegalUser = whiteList[env].includes(account[0].data.owner_id);
      return isLegalUser;
    }
    return true;
  }

  private async _handleLoginResponse(resp: IAuthResponse) {
    if (!resp.accountInfos || resp.accountInfos.length <= 0) {
      return { success: false, error: new Error('Auth fail') };
    }
    const isValid = await this.sanitizeUser(resp.accountInfos);
    if (!isValid) {
      throw Error('User not in the white list');
    }
    this.emit(EVENT_LOGIN, resp.accountInfos);
    this._isLogin = true;
    const accounts = this._createAccounts(resp.accountInfos);
    return {
      accounts,
      success: true,
    };
  }
}

export { AccountManager };
