/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-28 21:11:36
 */
import { mainLogger } from 'foundation';

import { loginGlip2ByPassword } from '../../api';
import { RCPasswordAuthenticator, UnifiedLoginAuthenticator } from '../../authenticator';
import { AuthDao, daoManager } from '../../dao';
import { AUTH_GLIP2_TOKEN } from '../../dao/auth/constants';
import { AccountManager } from '../../framework';
import { Aware, ErrorParser, ErrorTypes } from '../../utils/error';
import BaseService from '../BaseService';
import { SERVICE } from '../eventKey';
import notificationCenter from '../notificationCenter';

export interface Login {
  username: string;
  extension: string;
  password: string;
}

export interface UnifiedLogin {
  code: string;
}

export default class AuthService extends BaseService {
  static serviceName = 'AuthService';
  private _accountManager: AccountManager;

  constructor(accountManager: AccountManager) {
    super();
    this._accountManager = accountManager;
  }

  async unifiedLogin({ code }: UnifiedLogin) {
    try {
      const resp = await this._accountManager.login(UnifiedLoginAuthenticator.name, { code });
      mainLogger.info(`unifiedLogin finished ${JSON.stringify(resp)}`);
      this.onLogin();
    } catch (err) {
      mainLogger.warn(`unified login error: ${err}`);
    }
  }

  async login(params: Login) {
    await Promise.all([this.loginGlip(params), this.loginGlip2(params)]);
    this.onLogin();
  }

  onLogin() {
    // TODO replace all LOGIN listen on notificationCenter
    // with accountManager.on(EVENT_LOGIN)
    notificationCenter.emitService(SERVICE.LOGIN);
  }

  async loginGlip(params: Login) {
    try {
      await this._accountManager.login(RCPasswordAuthenticator.name, params);
    } catch (err) {
      mainLogger.error(`err: ${err}`);
      throw ErrorParser.parse(err);
    }
  }

  async loginGlip2(params: Login) {
    const authDao = daoManager.getKVDao(AuthDao);
    try {
      const glip2AuthData = await loginGlip2ByPassword(params);
      authDao.put(AUTH_GLIP2_TOKEN, glip2AuthData.data);
      notificationCenter.emitConfigPut(AUTH_GLIP2_TOKEN, glip2AuthData.data);
    } catch (err) {
      // Since glip2 api is no in use now, we can ignore all it's errors
      Aware(ErrorTypes.OAUTH, err.message);
    }
  }

  async logout() {
    await this._accountManager.logout();

    // TODO replace all LOGOUT listen on notificationCenter
    // with accountManager.on(EVENT_LOGOUT)
    notificationCenter.emitService(SERVICE.LOGOUT);
  }

  isLoggedIn(): boolean {
    return this._accountManager.isLoggedIn();
  }
}
