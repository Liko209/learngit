/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-04-03 15:28:24
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation/log';
import { glipStatus } from '../../../api';
import {
  RCPasswordAuthenticator,
  UnifiedLoginAuthenticator,
  GlipAuthenticator,
} from '../../../authenticator';
import { AccountManager, GLIP_LOGIN_STATUS } from '../../../framework';

import { SERVICE } from '../../../service/eventKey';
import notificationCenter from '../../../service/notificationCenter';
import {
  ErrorParserHolder,
  JServerError,
  ERROR_CODES_SERVER,
} from '../../../error';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { TaskController } from 'sdk/framework/controller/impl/TaskController';
import { ReLoginGlipStrategy } from '../strategy/ReLoginGlipStrategy';
import { dataCollectionHelper } from 'sdk/framework';
import { LoginInfo } from 'sdk/types';
import { RCInfoService } from 'sdk/module/rcInfo';
import { AccountService } from '../service';

interface ILogin {
  username: string;
  extension: string;
  password: string;
}

interface IUnifiedLogin {
  code?: string;
  token?: string;
}

const LOG_TAG = 'AuthController';

class AuthController {
  private _accountManager: AccountManager;
  private _loginGlipTask: TaskController;

  constructor(accountManager: AccountManager) {
    this._accountManager = accountManager;
  }

  async unifiedLogin({ code, token }: IUnifiedLogin) {
    try {
      const resp = await this._accountManager.login(
        UnifiedLoginAuthenticator.name,
        { code, token },
      );
      dataCollectionHelper.traceLoginSuccess({
        accountType: 'rc',
        userId: 0,
        companyId: 0,
      });
      mainLogger
        .tags(LOG_TAG)
        .info(`unifiedLogin finished ${JSON.stringify(resp)}`);
    } catch (err) {
      mainLogger.tags(LOG_TAG).error(`unified login error: ${err}`);
      throw ErrorParserHolder.getErrorParser().parse(err);
    }
  }

  async loginGlip(params: ILogin) {
    try {
      await this._accountManager.login(RCPasswordAuthenticator.name, params);
    } catch (err) {
      mainLogger.tags(LOG_TAG).error(`err: ${err}`);
      throw ErrorParserHolder.getErrorParser().parse(err);
    }
  }

  async makeSureUserInWhitelist() {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );

    const authConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).authUserConfig;

    const rc_token_info = authConfig.getRCToken();
    if (rc_token_info && rc_token_info.owner_id) {
      const email = await rcInfoService.getUserEmail();
      if (email) {
        const prefix = email.split('@').pop();
        if (prefix) {
          await this._accountManager.makeSureUserInWhitelist(prefix, rc_token_info.owner_id);
        }
      }
      else {
        await this._accountManager.makeSureUserInWhitelist("", rc_token_info.owner_id);
      }
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

  isRCOnlyMode(): boolean {
    return this._accountManager.isRCOnlyMode();
  }

  getGlipLoginStatus(): GLIP_LOGIN_STATUS {
    return this._accountManager.getGlipLoginStatus();
  }

  startLoginGlip() {
    if (!this._loginGlipTask) {
      this._loginGlipTask = new TaskController(
        new ReLoginGlipStrategy(),
        this.GlipLoginFunc,
      );
    }
    this._loginGlipTask.start();
  }

  GlipLoginFunc = async (): Promise<void> => {
    try {
      let result = true;
      this._accountManager.setGlipLoginStatus(GLIP_LOGIN_STATUS.PROCESS);
      const status = await glipStatus();
      if (status === 'OK') {
        result = await this._accountManager.glipLogin(GlipAuthenticator.name);
      } else {
        result = false;
      }
      if (!result) {
        throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'glip login error');
      }
    } catch (err) {
      mainLogger.tags(LOG_TAG).error(err);
      const glipLoginInfo: LoginInfo = { success: false, isFirstLogin: true };
      notificationCenter.emitKVChange(SERVICE.GLIP_LOGIN, glipLoginInfo);
      this._accountManager.setGlipLoginStatus(GLIP_LOGIN_STATUS.FAILURE);
      throw err;
    }
  };
}

export { IUnifiedLogin, ILogin, AuthController };
