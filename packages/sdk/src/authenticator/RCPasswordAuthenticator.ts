/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-08 07:52:23
 * Copyright © RingCentral. All rights reserved.
 */
import { loginGlip, loginRCByPassword } from '../api';
import { IAuthenticator, IAuthParams, IAuthResponse } from '../framework';
import { ACCOUNT_TYPE_ENUM } from './constants';
import { setRcToken } from './utils';
import { AuthUserConfig } from '../service/auth/config';
import { RCAccount, GlipAccount } from '../account';
import { AccountUserConfig } from '../service/account/config';

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

    const rcAuthData = await loginRCByPassword(params);
    const glipAuthResponse = await loginGlip(rcAuthData);

    setRcToken(rcAuthData);

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
