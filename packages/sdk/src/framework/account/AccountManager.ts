/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 14:19:24
 * Copyright © RingCentral. All rights reserved
 */
import { EventEmitter2 } from 'eventemitter2';
import _ from 'lodash';
import { mainLogger } from 'foundation/log';
import { Container } from 'foundation/ioc';
import { fetchWhiteList } from './helper';
import { AbstractAccount } from './AbstractAccount';
import { IAccount } from './IAccount';
import { AppEnvSetting } from '../../module/env';

import {
  IAccountInfo,
  IAuthenticator,
  IAuthResponse,
  ISyncAuthenticator,
} from './IAuthenticator';

const START_LOGIN = 'ACCOUNT_MANAGER.START_LOGIN';
const AUTH_SUCCESS = 'ACCOUNT_MANAGER.AUTH_SUCCESS';
const EVENT_LOGOUT = 'ACCOUNT_MANAGER.EVENT_LOGOUT';
const EVENT_SUPPORTED_SERVICE_CHANGE =
  'ACCOUNT_MANAGER.EVENT_SUPPORTED_SERVICE_CHANGE';
enum GLIP_LOGIN_STATUS {
  PROCESS,
  SUCCESS,
  FAILURE,
}

class AccountManager extends EventEmitter2 {
  static START_LOGIN = START_LOGIN;
  static AUTH_SUCCESS = AUTH_SUCCESS;
  static EVENT_LOGOUT = EVENT_LOGOUT;
  static EVENT_SUPPORTED_SERVICE_CHANGE = EVENT_SUPPORTED_SERVICE_CHANGE;

  private _isLogin = false;
  private _isRCOnlyMode = false;
  private _glipLoginStatus = GLIP_LOGIN_STATUS.PROCESS;
  private _accountMap: Map<string, IAccount> = new Map();
  private _accounts: IAccount[] = [];

  constructor(private _container: Container) {
    super();
  }

  async syncLogin(authType: string, params?: any) {
    const authenticator = this._container.get<ISyncAuthenticator>(authType);
    const resp = authenticator.authenticate(params);
    if (resp.success) {
      await this.emitAsync(START_LOGIN, true);
    }
    return this._handleAuthResponse(resp);
  }

  async login(authType: string, params?: any) {
    await this.emitAsync(START_LOGIN, false);
    const authenticator = this._container.get<IAuthenticator>(authType);
    const resp = await authenticator.authenticate(params);
    if (!resp.accountInfos) {
      throw Error('Auth fail');
    }
    const mailbox = resp.accountInfos[0].emailAddress;
    const userId = resp.accountInfos[0].data.owner_id;
    if (mailbox) {
        const suffix = mailbox.split('@').pop();
        if (suffix) {
          await this.makeSureUserInWhitelist(suffix, userId);
        }
    }
    else {
      await this.makeSureUserInWhitelist("", userId);
    }

    return this._handleAuthResponse(resp);
  }

  async glipLogin(authType: string): Promise<boolean> {
    const authenticator = this._container.get<IAuthenticator>(authType);
    const resp = await authenticator.authenticate({});
    if (!resp.success) {
      return false;
    }
    this._handleAuthResponse(resp);
    return true;
  }

  async makeSureUserInWhitelist(mailbox: string, userId: string) {
    const isValidMailbox = await this.sanitizeUser(mailbox, true);
    if (!isValidMailbox) {
      const isValidUserId = await this.sanitizeUser(userId, false);
      if (!isValidUserId) {
        await this.logout();
        mainLogger.warn('[Auth]User not in the white list');
        window.location.href = '/';
      }
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

  isRCOnlyMode(): boolean {
    return this._isRCOnlyMode;
  }

  setGlipLoginStatus(status: GLIP_LOGIN_STATUS): void {
    this._glipLoginStatus = status;
  }

  getGlipLoginStatus(): GLIP_LOGIN_STATUS {
    return this._glipLoginStatus;
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

  async sanitizeUser(targetId: string, isMailbox: boolean) {
    const env = AppEnvSetting.getEnv();
    const whiteList = await fetchWhiteList(isMailbox);
    const allAccount = whiteList[env];
    if (allAccount !== undefined) {
      const isLegalUser = allAccount.some(
        (account: string) => account === targetId,
      );
      mainLogger.info(
        `[Auth]${targetId} ${
          isLegalUser ? '' : 'not '
        }in whitelist for ${env}`,
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
    this._isLogin = true;
    this._isRCOnlyMode = !!resp.isRCOnlyMode;
    const accounts = this._createAccounts(resp.accountInfos);
    this.emit(AUTH_SUCCESS, resp);
    return {
      accounts,
      resp,
      success: true,
    };
  }
}

export { AccountManager, GLIP_LOGIN_STATUS };
