/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-08 07:52:23
 * Copyright © RingCentral. All rights reserved.
 */
import { loginGlip, loginRCByPassword } from '../api';
import { AuthDao, daoManager, ConfigDao } from '../dao';
import { AUTH_GLIP_TOKEN, AUTH_RC_TOKEN } from '../dao/auth/constants';
import { IAuthenticator, IAuthParams, IAuthResponse } from '../framework';
import notificationCenter from '../service/notificationCenter';
import { GlipAccount, RCAccount } from '../account';
import { ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM } from './constants';

interface RCPasswordAuthenticateParams extends IAuthParams {
  username: string;
  password: string;
  extension?: string;
}

class RCPasswordAuthenticator implements IAuthenticator {
  async authenticate(params: RCPasswordAuthenticateParams): Promise<IAuthResponse> {
    params.username = this.parsePhoneNumber(params.username);

    const rcAuthData = await loginRCByPassword(params);
    const glipAuthData = await loginGlip(rcAuthData.data);

    const authDao = daoManager.getKVDao(AuthDao);
    authDao.put(AUTH_RC_TOKEN, rcAuthData.data);
    authDao.put(AUTH_GLIP_TOKEN, glipAuthData.headers['x-authorization']);

    const configDao = daoManager.getKVDao(ConfigDao);
    configDao.put(ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM.RC);

    notificationCenter.emitConfigPut(AUTH_RC_TOKEN, rcAuthData.data);
    notificationCenter.emitConfigPut(AUTH_GLIP_TOKEN, glipAuthData.headers['x-authorization']);

    return {
      success: true,
      accountInfos: [
        {
          type: RCAccount.name,
          data: rcAuthData,
        },
        {
          type: GlipAccount.name,
          data: glipAuthData,
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
