/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 11:22:31
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation';

import { loginGlip2ByPassword } from '../../api';
import {
  RCPasswordAuthenticator,
  UnifiedLoginAuthenticator,
} from '../../authenticator';
import { AuthDao, daoManager } from '../../dao';
import { AUTH_GLIP2_TOKEN, AUTH_RC_TOKEN } from '../../dao/auth/constants';
import { AccountManager } from '../../framework';
import { Aware } from '../../utils/error';
import BaseService from '../BaseService';
import { SERVICE } from '../eventKey';
import notificationCenter from '../notificationCenter';
import { ERROR_CODES_SDK, ErrorParserHolder } from '../../error';

interface ILogin {
  username: string;
  extension: string;
  password: string;
}

interface IUnifiedLogin {
  code?: string;
  token?: string;
}

class AuthService extends BaseService {
  static serviceName = 'AuthService';
  private _accountManager: AccountManager;

  constructor(accountManager: AccountManager) {
    super();
    this._accountManager = accountManager;
  }

  async unifiedLogin({ code, token }: IUnifiedLogin) {
    try {
      const resp = await this._accountManager.login(
        UnifiedLoginAuthenticator.name,
        { code, token },
      );
      mainLogger.info(`unifiedLogin finished ${JSON.stringify(resp)}`);
    } catch (err) {
      mainLogger.error(`unified login error: ${err}`);
      throw ErrorParserHolder.getErrorParser().parse(err);
    }
  }

  async login(params: ILogin) {
    await Promise.all([this.loginGlip(params), this.loginGlip2(params)]);
    this.onLogin();
  }

  onLogin() {
    // TODO replace all LOGIN listen on notificationCenter
    // with accountManager.on(EVENT_LOGIN)
    notificationCenter.emitKVChange(SERVICE.LOGIN);
  }

  async loginGlip(params: ILogin) {
    try {
      await this._accountManager.login(RCPasswordAuthenticator.name, params);
    } catch (err) {
      mainLogger.error(`err: ${err}`);
      throw ErrorParserHolder.getErrorParser().parse(err);
    }
  }

  async loginGlip2(params: ILogin) {
    const authDao = daoManager.getKVDao(AuthDao);
    try {
      const authToken = await loginGlip2ByPassword(params);
      authDao.put(AUTH_GLIP2_TOKEN, authToken);
      notificationCenter.emitKVChange(AUTH_GLIP2_TOKEN, authToken);
    } catch (err) {
      // Since glip2 api is no in use now, we can ignore all it's errors
      Aware(ERROR_CODES_SDK.OAUTH, err.message);
    }
  }

  async makeSureUserInWhitelist() {
    const authDao = daoManager.getKVDao(AuthDao);
    const rc_token_info = authDao.get(AUTH_RC_TOKEN);
    if (rc_token_info && rc_token_info.owner_id) {
      await this._accountManager.makeSureUserInWhitelist(
        rc_token_info.owner_id,
      );
    }
  }

  async logout() {
    // TODO replace all LOGOUT listen on notificationCenter
    // with accountManager.on(EVENT_LOGOUT)
    notificationCenter.emitKVChange(SERVICE.LOGOUT);
    await this._accountManager.logout();
  }

  isLoggedIn(): boolean {
    return this._accountManager.isLoggedIn();
  }
}

export { IUnifiedLogin, ILogin, AuthService };
