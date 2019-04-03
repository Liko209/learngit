/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 14:00:31
 * Copyright © RingCentral. All rights reserved
 */
import { IAuthenticator, IAuthParams, IAuthResponse } from '../framework';
import { loginGlip, ITokenModel } from '../api';
import { RcInfoApi } from '../api/ringcentral';
import notificationCenter from '../service/notificationCenter';
import { GlipAccount, RCAccount } from '../account';
import { oauthTokenViaAuthCode } from '../api/ringcentral/auth';
import { SHOULD_UPDATE_NETWORK_TOKEN } from '../service/constants';
import { RcInfoService } from '../module/rcInfo';
import { setRcToken, setRcAccountType } from './utils';
import { AccountGlobalConfig } from '../service/account/config';

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
    notificationCenter.emit(SHOULD_UPDATE_NETWORK_TOKEN, { glipToken: token });
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
    // login rc
    const rcToken = await this._fetchRcToken(code);
    await this._requestRcAccountRelativeInfo();
    await setRcToken(rcToken);
    await setRcAccountType();
    // TODO FIJI-4395

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

    // login glip
    try {
      const glipToken = await this._loginGlipByRcToken(rcToken);
      response.accountInfos.push({
        type: GlipAccount.name,
        data: glipToken,
      });
    } catch (err) {
      // todo: for now, ui can not support the rc only mode
      // so will throw error to logout when glip is down
      // mainLogger.tags('UnifiedLogin').error(err);
      // response.isRCOnlyMode = true;
      throw err;
    }
    return response;
  }

  private async _fetchRcToken(code: string): Promise<ITokenModel> {
    const rcToken = await oauthTokenViaAuthCode({
      code,
      redirect_uri: window.location.origin,
    });

    notificationCenter.emit(SHOULD_UPDATE_NETWORK_TOKEN, { rcToken });
    return rcToken;
  }

  private async _requestRcAccountRelativeInfo() {
    await RcInfoApi.requestRcAPIVersion();
    const rcInfoService: RcInfoService = RcInfoService.getInstance();
    await rcInfoService.requestRcAccountRelativeInfo();
    AccountGlobalConfig.setUserDictionary(
      rcInfoService.getRcExtensionInfo().id.toString(),
    );
  }

  private async _loginGlipByRcToken(rcToken: ITokenModel) {
    // fetch glip token
    const glipLoginResponse = await loginGlip(rcToken);
    if (glipLoginResponse.status >= 200 && glipLoginResponse.status < 300) {
      const glipToken = glipLoginResponse.headers['x-authorization'];
      notificationCenter.emit(SHOULD_UPDATE_NETWORK_TOKEN, {
        glipToken,
      });
      return glipToken;
    }
    throw Error(`login glip failed, ${glipLoginResponse.statusText}`);
  }
}

export { UnifiedLoginAuthenticator };
