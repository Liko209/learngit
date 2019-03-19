/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-08 07:52:17
 * Copyright © RingCentral. All rights reserved.
 */
import { IAuthResponse, ISyncAuthenticator } from '../framework';
import { ACCOUNT_TYPE_ENUM } from './constants';
import DaoManager from '../dao/DaoManager';
import { AuthGlobalConfig } from '../service/auth/config';
import { NewGlobalConfig } from '../service/config/NewGlobalConfig';
import { RCAccount, GlipAccount } from '../account';

class AutoAuthenticator implements ISyncAuthenticator {
  private _accountTypeHandleMap: Map<string, any>;

  constructor(daoManager: DaoManager) {
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
    const type: string = NewGlobalConfig.getAccountType();
    const func = this._accountTypeHandleMap.get(type);

    if (func) {
      return func();
    }

    return { success: false };
  }

  private _authGlipLogin(): IAuthResponse {
    const glipToken: string = AuthGlobalConfig.getGlipToken();

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
    const rcToken: string = AuthGlobalConfig.getRcToken();
    const glipToken: string = AuthGlobalConfig.getGlipToken();

    if (rcToken && glipToken) {
      return {
        success: true,
        accountInfos: [
          {
            type: RCAccount.name,
            data: rcToken,
          },
          {
            type: GlipAccount.name,
            data: glipToken,
          },
        ],
      };
    }

    return { success: false };
  }
}

export { AutoAuthenticator };
