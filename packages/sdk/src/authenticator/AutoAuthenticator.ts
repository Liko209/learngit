/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-08 07:52:17
 * Copyright © RingCentral. All rights reserved.
 */
import { AuthDao, ConfigDao } from '../dao';
import { AUTH_GLIP_TOKEN, AUTH_RC_TOKEN } from '../dao/auth/constants';
import { IAuthResponse, ISyncAuthenticator } from '../framework';
import { GlipAccount, RCAccount } from '../account';
import { ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM } from './constants';
import DaoManager from '../dao/DaoManager';

class AutoAuthenticator implements ISyncAuthenticator {
  private _accountTypeHandleMap: Map<string, any>;
  private _daoManager: DaoManager;

  constructor(daoManager: DaoManager) {
    this._daoManager = daoManager;
    this._accountTypeHandleMap = new Map<string, any>();
    this._accountTypeHandleMap.set(ACCOUNT_TYPE_ENUM.RC, this.authRCLogin.bind(this));
    this._accountTypeHandleMap.set(ACCOUNT_TYPE_ENUM.GLIP, this.authGlipLogin.bind(this));
  }

  authenticate(): IAuthResponse {
    const configDao = this._daoManager.getKVDao(ConfigDao);
    const type: string = configDao.get(ACCOUNT_TYPE);
    const func = this._accountTypeHandleMap.get(type);

    if (func) {
      return func();
    }

    return { success: false };
  }

  private authGlipLogin(): IAuthResponse {
    const authDao = this._daoManager.getKVDao(AuthDao);
    const glipToken: string = authDao.get(AUTH_GLIP_TOKEN);

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

  private authRCLogin(): IAuthResponse {
    const authDao = this._daoManager.getKVDao(AuthDao);
    const rcToken: string = authDao.get(AUTH_RC_TOKEN);
    const glipToken: string = authDao.get(AUTH_GLIP_TOKEN);

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
