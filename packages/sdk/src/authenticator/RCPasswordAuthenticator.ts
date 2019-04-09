/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-08 07:52:23
 * Copyright © RingCentral. All rights reserved.
 */
import { loginGlip, RCAuthApi } from '../api';
import { IAuthenticator, IAuthParams, IAuthResponse } from '../framework';
import { ACCOUNT_TYPE_ENUM } from './constants';
import { setRCToken } from './utils';
import { AuthUserConfig, AccountUserConfig } from '../module/account/config';
import { RCAccount, GlipAccount } from '../account';

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

    const authConfig = new AuthUserConfig();
    authConfig.setGlipToken(glipAuthResponse.headers['x-authorization']);

    const userConfig = new AccountUserConfig();
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
