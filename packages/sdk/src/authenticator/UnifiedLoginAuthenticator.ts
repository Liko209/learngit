/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 14:00:31
 * Copyright © RingCentral. All rights reserved
 */
import { IAuthenticator, IAuthParams, IAuthResponse } from '../framework';
import { loginGlip, RCInfoApi, RCAuthApi, ITokenModel } from '../api';
import notificationCenter from '../service/notificationCenter';
import { GlipAccount, RCAccount } from '../account';
import { SHOULD_UPDATE_NETWORK_TOKEN } from '../service/constants';

import { RCInfoService } from '../module/rcInfo';
import { setRCToken, setRCAccountType } from './utils';
import { AccountGlobalConfig } from '../module/account/config';
import { ServiceLoader, ServiceConfig } from '../module/serviceLoader';
import { PerformanceTracer, PERFORMANCE_KEYS } from '../utils';

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
    const performanceTracer = PerformanceTracer.initial();
    if (params.code) {
      return this._authenticateRC(params.code);
    }

    if (params.token) {
      return this._authenticateGlip(params.token);
    }
    performanceTracer.end({ key: PERFORMANCE_KEYS.UNIFIED_LOGIN });
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
      isFirstLogin: true,
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
    const rcToken = await this._fetchRCToken(code);
    await this._requestRCAccountRelativeInfo();
    await setRCToken(rcToken);
    await setRCAccountType();
    // TODO FIJI-4395

    const response = {
      success: true,
      isRCOnlyMode: false,
      isFirstLogin: true,
      accountInfos: [
        {
          type: RCAccount.name,
          data: rcToken,
        },
      ],
    };

    // login glip
    try {
      const glipToken = await this._loginGlipByRCToken(rcToken);
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

  private async _fetchRCToken(code: string): Promise<ITokenModel> {
    const rcToken = await RCAuthApi.oauthTokenViaAuthCode({
      code,
      redirect_uri: window.location.origin,
    });

    notificationCenter.emit(SHOULD_UPDATE_NETWORK_TOKEN, { rcToken });
    return rcToken;
  }

  private async _requestRCAccountRelativeInfo() {
    await RCInfoApi.requestRCAPIVersion();
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    await rcInfoService.requestRCAccountRelativeInfo();
    AccountGlobalConfig.setUserDictionary(
      (await rcInfoService.getRCExtensionInfo())!.id.toString(),
    );
  }

  private async _loginGlipByRCToken(rcToken: ITokenModel) {
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
