/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-08 07:52:23
 * Copyright © RingCentral. All rights reserved.
 */
import { loginGlip, loginRCByPassword } from '../api';
import { IAuthenticator, IAuthParams, IAuthResponse } from '../framework';
import { GlipAccount, RCAccount } from '../account';
import { ACCOUNT_TYPE_ENUM } from './constants';
import { setRcToken } from './utils';
import { NewGlobalConfig } from '../service/config';
import { AuthGlobalConfig } from '../service/auth/config';

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

    const rcLoginResult = await loginRCByPassword(params);
    const rcAuthData = rcLoginResult.expect('Failed to login RC By password.');
    const glipAuthResult = await loginGlip(rcAuthData);
    glipAuthResult.expect('Failed to login Glip.');

    setRcToken(rcAuthData);

    AuthGlobalConfig.setGlipToken(glipAuthResult.headers['x-authorization']);

    NewGlobalConfig.getInstance().setAccountType(ACCOUNT_TYPE_ENUM.RC);

    return {
      success: true,
      accountInfos: [
        {
          type: RCAccount.name,
          data: rcLoginResult,
        },
        {
          type: GlipAccount.name,
          data: glipAuthResult,
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
