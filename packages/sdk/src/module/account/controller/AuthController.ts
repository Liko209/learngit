/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-04-03 15:28:24
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation';
import { glipStatus, RCAuthApi } from '../../../api';
import {
  RCPasswordAuthenticator,
  UnifiedLoginAuthenticator,
  ReLoginAuthenticator,
} from '../../../authenticator';
import { AUTH_GLIP2_TOKEN } from '../../../dao/auth/constants';
import { AccountManager } from '../../../framework';
import { Aware } from '../../../utils/error';

import { SERVICE } from '../../../service/eventKey';
import notificationCenter from '../../../service/notificationCenter';
import { ERROR_CODES_SDK, ErrorParserHolder } from '../../../error';
import { jobScheduler, JOB_KEY } from '../../../framework/utils/jobSchedule';
import { AuthUserConfig } from '../config';

interface ILogin {
  username: string;
  extension: string;
  password: string;
}

interface IUnifiedLogin {
  code?: string;
  token?: string;
}

class AuthController {
  private _accountManager: AccountManager;

  constructor(accountManager: AccountManager) {
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

  async loginGlip(params: ILogin) {
    try {
      await this._accountManager.login(RCPasswordAuthenticator.name, params);
    } catch (err) {
      mainLogger.error(`err: ${err}`);
      throw ErrorParserHolder.getErrorParser().parse(err);
    }
  }

  async loginGlip2(params: ILogin) {
    const authConfig = new AuthUserConfig();
    try {
      const authToken = await RCAuthApi.loginGlip2ByPassword(params);
      authConfig.setGlip2Token(authToken);
      notificationCenter.emitKVChange(AUTH_GLIP2_TOKEN, authToken);
    } catch (err) {
      // Since glip2 api is no in use now, we can ignore all it's errors
      Aware(ERROR_CODES_SDK.OAUTH, err.message);
    }
  }

  async makeSureUserInWhitelist() {
    const authConfig = new AuthUserConfig();
    const rc_token_info = authConfig.getRCToken();
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

  scheduleReLoginGlipJob() {
    jobScheduler.scheduleAndIgnoreFirstTime({
      key: JOB_KEY.RE_LOGIN_GLIP,
      intervalSeconds: 3600,
      periodic: false,
      needNetwork: true,
      retryForever: true,
      executeFunc: async (callback: (successful: boolean) => void) => {
        if (await this.reLoginGlip()) {
          callback(true);
        } else {
          callback(false);
        }
      },
    });
  }

  async reLoginGlip(): Promise<boolean> {
    try {
      const status = await glipStatus();
      if (status !== 'OK') {
        return false;
      }
      return await this._accountManager.reLogin(ReLoginAuthenticator.name);
    } catch (err) {
      mainLogger.tags('ReLoginGlip').error(err);
      return false;
    }
  }

  onLogin() {
    // TODO replace all LOGIN listen on notificationCenter
    // with accountManager.on(EVENT_LOGIN)
    notificationCenter.emitKVChange(SERVICE.LOGIN);
  }
}

export { IUnifiedLogin, ILogin, AuthController };
