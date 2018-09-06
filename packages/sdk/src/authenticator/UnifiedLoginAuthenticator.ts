/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 14:00:31
 * Copyright © RingCentral. All rights reserved
*/
import { IAuthenticator, IAuthParams, IAuthResponse } from '../framework';
import { Api, loginGlip } from '../api';

import notificationCenter from '../service/notificationCenter';
import { AUTH_GLIP_TOKEN, AUTH_RC_TOKEN } from '../dao/auth/constants';
import { GlipAccount, RCAccount } from '../account';
import { ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM } from './constants';
import { AuthDao, daoManager, ConfigDao } from '../dao';
import { generateCode, oauthTokenViaAuthCode } from '../api/ringcentral/auth';
import { SHOULD_UPDATE_NETWORK_TOKEN } from '../service/constants';

interface UnifiedLoginAuthenticateParams extends IAuthParams {
  code?: string;
  token?: string;
}

class UnifiedLoginAuthenticator implements IAuthenticator {

  /**
   * should consider 2 cases
   * 1. RC account
   * 2. Glip account
   * we only consider 1 now, will implement case 2 in the future
   */
  async authenticate(params: UnifiedLoginAuthenticateParams): Promise<IAuthResponse> {

    if (params.code) {
      return this._authenticateRC(params.code);
    }

    if (params.token) {
      return this._authenticateGlip(params.token);
    }

    return {
      success: false,
      error: new Error('invalid tokens'),
    };
  }

  private async _authenticateGlip(token: string): Promise<IAuthResponse> {
    return { success: true };
  }

  private async _authenticateRC(code: string): Promise<IAuthResponse> {
    const { rc } = Api.httpConfig;

    const authData = await oauthTokenViaAuthCode({
      code,
      redirect_uri: `${window.location.origin}/unified-login/`,
    });

    const authDao = daoManager.getKVDao(AuthDao);
    authDao.put(AUTH_RC_TOKEN, authData.data);
    notificationCenter.emit(SHOULD_UPDATE_NETWORK_TOKEN);

    const authCode = await generateCode(rc.clientId, rc.redirectUri);
    const newCode = authCode.data.code;

    const newData = await oauthTokenViaAuthCode(
      { code: newCode, redirect_uri: 'glip://rclogin' },
      {
        Authorization: `Basic ${btoa(`${rc.clientId}:${rc.clientSecret}`)}`,
      },
    );
    const glipAuthData = await loginGlip(newData.data);

    const configDao = daoManager.getKVDao(ConfigDao);
    configDao.put(ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM.RC);

    const glipToken = glipAuthData.headers['x-authorization'];
    authDao.put(AUTH_GLIP_TOKEN, glipToken);

    notificationCenter.emitConfigPut(AUTH_RC_TOKEN, authData.data);
    notificationCenter.emitConfigPut(AUTH_GLIP_TOKEN, glipToken);

    return {
      success: true,
      accountInfos: [
        {
          type: RCAccount.name,
          data: authData.data,
        },
        {
          type: GlipAccount.name,
          data: glipToken,
        },
      ],
    };
  }
}

export { UnifiedLoginAuthenticator };
