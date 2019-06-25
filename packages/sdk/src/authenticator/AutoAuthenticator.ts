/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-08 07:52:17
 * Copyright © RingCentral. All rights reserved.
 */
import { IAuthResponse, ISyncAuthenticator } from '../framework';
import { ACCOUNT_TYPE_ENUM } from './constants';
import { RCAccount, GlipAccount } from '../account';
import { AccountGlobalConfig } from '../module/account/config';
import { AccountService } from '../module/account/service';
import { ServiceLoader, ServiceConfig } from '../module/serviceLoader';

class AutoAuthenticator implements ISyncAuthenticator {
  private _accountTypeHandleMap: Map<string, any>;

  constructor() {
    this._accountTypeHandleMap = new Map<string, any>();
    this._accountTypeHandleMap.set(
      ACCOUNT_TYPE_ENUM.RC,
      this._authRCLogin.bind(this),
    );
    this._accountTypeHandleMap.set(
      ACCOUNT_TYPE_ENUM.GLIP,
      this._authGlipLogin.bind(this),
    );
  }

  authenticate(): IAuthResponse {
    let type: string = '';
    if (AccountGlobalConfig.getUserDictionary()) {
      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      type = userConfig.getAccountType();
    }
    const func = this._accountTypeHandleMap.get(type);

    if (func) {
      return func();
    }

    return { success: false };
  }

  private _authGlipLogin(): IAuthResponse {
    const authConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).authUserConfig;
    const glipToken: string = authConfig.getGlipToken();

    if (glipToken) {
      return {
        success: true,
        isFirstLogin: false,
        accountInfos: [
          {
            type: GlipAccount.name,
            data: glipToken,
          },
        ],
      };
    }

    return { success: false };
  }

  private _authRCLogin(): IAuthResponse {
    const authConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).authUserConfig;
    const rcToken = authConfig.getRCToken();
    if (!rcToken) {
      return { success: false };
    }

    const response = {
      success: true,
      isRCOnlyMode: false,
      isFirstLogin: false,
      accountInfos: [
        {
          type: RCAccount.name,
          data: rcToken,
        },
      ],
    };

    const glipToken: string = authConfig.getGlipToken();
    if (glipToken) {
      response.accountInfos.push({
        type: GlipAccount.name,
        data: glipToken,
      });
    } else {
      // todo: for now, ui can not support the rc only mode
      // so will return false to logout when glip is down
      // response.isRCOnlyMode = true;
      return { success: false };
    }

    return response;
  }
}

export { AutoAuthenticator };
