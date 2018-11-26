/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 14:00:31
 * Copyright © RingCentral. All rights reserved
 */
import { IAuthenticator, IAuthParams, IAuthResponse } from '../framework';
import { Api, loginGlip } from '../api';
import notificationCenter from '../service/notificationCenter';
import { GlipAccount, RCAccount } from '../account';
import { generateCode, oauthTokenViaAuthCode } from '../api/ringcentral/auth';
import { SHOULD_UPDATE_NETWORK_TOKEN } from '../service/constants';
import {
  setRcToken,
  setRcAccountType,
  setGlipToken,
  setGlipAccountType,
} from './utils';

interface IUnifiedLoginAuthenticateParams extends IAuthParams {
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
  async authenticate(
    params: IUnifiedLoginAuthenticateParams,
  ): Promise<IAuthResponse> {
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

  // glip free user login
  private async _authenticateGlip(token: string): Promise<IAuthResponse> {
    await setGlipAccountType();
    await setGlipToken(token);
    return {
      success: true,
      accountInfos: [
        {
          type: GlipAccount.name,
          data: token,
        },
      ],
    };
  }

  // rc user login
  private async _authenticateRC(code: string): Promise<IAuthResponse> {
    const { rc } = Api.httpConfig;

    // fetch rc token
    const rcOauthResult = await oauthTokenViaAuthCode({
      code,
      redirect_uri: window.location.origin,
    });
    const rcToken = rcOauthResult.expect(
      'Failed to oauth token via auth code.',
    );
    await setRcToken(rcToken);
    await setRcAccountType();
    notificationCenter.emit(SHOULD_UPDATE_NETWORK_TOKEN);

    // fetch new code for glip token
    const codeResult = await generateCode(rc.clientId, rc.redirectUri);
    const codeData = codeResult.expect('Failed to generate code');
    const newCode = codeData.code;

    // fetch request params for glip token
    const glipParamsResult = await oauthTokenViaAuthCode(
      { code: newCode, redirect_uri: 'glip://rclogin' },
      { Authorization: `Basic ${btoa(`${rc.clientId}:${rc.clientSecret}`)}` },
    );
    const glipParams = glipParamsResult.expect(
      'Failed to oauth token via auth code.',
    );
    // fetch glip token
    const glipLoginResult = await loginGlip(glipParams);
    glipLoginResult.expect('Failed to login Glip.');
    const glipToken = glipLoginResult.headers['x-authorization'];
    await setGlipToken(glipToken);

    return {
      success: true,
      accountInfos: [
        {
          type: RCAccount.name,
          data: rcToken,
        },
        {
          type: GlipAccount.name,
          data: glipParams,
        },
      ],
    };
  }
}

export { UnifiedLoginAuthenticator };
