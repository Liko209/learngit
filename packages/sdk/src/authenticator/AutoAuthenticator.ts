/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-08 07:52:17
 * Copyright © RingCentral. All rights reserved.
 */
import { IAuthResponse, ISyncAuthenticator } from '../framework';
import { ACCOUNT_TYPE_ENUM } from './constants';
import { AuthUserConfig } from '../service/auth/config';
import { RCAccount, GlipAccount } from '../account';
import {
  AccountGlobalConfig,
  AccountUserConfig,
} from '../service/account/config';

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
      const userConfig = new AccountUserConfig();
      type = userConfig.getAccountType();
    }
    const func = this._accountTypeHandleMap.get(type);

    if (func) {
      return func();
    }

    return { success: false };
  }

  private _authGlipLogin(): IAuthResponse {
    const authConfig = new AuthUserConfig();
    const glipToken: string = authConfig.getGlipToken();

    if (glipToken) {
      return {
        success: true,
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
    const authConfig = new AuthUserConfig();
    const rcToken: string = authConfig.getRcToken();
    if (!rcToken) {
      return { success: false };
    }

    const response = {
      success: true,
      isRCOnlyMode: false,
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
