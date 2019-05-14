/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-08 07:52:23
 * Copyright © RingCentral. All rights reserved.
 */
import { loginGlip, RCAuthApi } from '../api';
import { IAuthenticator, IAuthParams, IAuthResponse } from '../framework';
import { ACCOUNT_TYPE_ENUM } from './constants';
import { setRCToken } from './utils';
import { AccountService } from '../module/account/service';
import { RCAccount, GlipAccount } from '../account';
import { ServiceLoader, ServiceConfig } from '../module/serviceLoader';

interface IRCPasswordAuthenticateParams extends IAuthParams {
  username: string;
  password: string;
  extension?: string;
}

class RCPasswordAuthenticator implements IAuthenticator {
  async authenticate(
    params: IRCPasswordAuthenticateParams,
  ): Promise<IAuthResponse> {
    params.username = this.parsePhoneNumber(params.username);

    const rcAuthData = await RCAuthApi.loginRCByPassword(params);
    const glipAuthResponse = await loginGlip(rcAuthData);

    setRCToken(rcAuthData);

    const authConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).authUserConfig;
    authConfig.setGlipToken(glipAuthResponse.headers['x-authorization']);

    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    userConfig.setAccountType(ACCOUNT_TYPE_ENUM.RC);

    return {
      success: true,
      accountInfos: [
        {
          type: RCAccount.name,
          data: rcAuthData,
        },
        {
          type: GlipAccount.name,
          data: glipAuthResponse.data,
        },
      ],
    };
  }

  parsePhoneNumber(phoneNumber: string): string {
    return phoneNumber.length >= 10
      ? `${(phoneNumber.substring(0, phoneNumber.length - 10) || '1') +
          phoneNumber.substring(phoneNumber.length - 10, phoneNumber.length)}`
      : phoneNumber;
  }
}

export { RCPasswordAuthenticator };
