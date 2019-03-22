/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 13:14:35
 * Copyright © RingCentral. All rights reserved
 */

import { AutoAuthenticator } from '../AutoAuthenticator';
import { daoManager } from '../../dao';
import { ACCOUNT_TYPE_ENUM } from '../constants';
import { GlobalConfigService } from '../../module/config';
import { AuthUserConfig } from '../../service/auth/config';
import {
  AccountUserConfig,
  AccountGlobalConfig,
} from '../../service/account/config';

jest.mock('../../module/config');
jest.mock('../../service/config/NewGlobalConfig');
jest.mock('../../service/auth/config');
jest.mock('../../service/account/config');

GlobalConfigService.getInstance = jest.fn();

describe('AutoAuthenticator', () => {
  const autoAuthenticator = new AutoAuthenticator(daoManager);
  let authConfig: AuthUserConfig;
  let accountConfig: AccountUserConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValue('12');
    authConfig = new AuthUserConfig();
    accountConfig = new AccountUserConfig();
  });

  describe('user has not loggin', () => {
    const resp = autoAuthenticator.authenticate();
    expect(resp.success).toBe(false);
  });
  describe('GLIP user', () => {
    it('GLIP user type but has not token', () => {
      AccountUserConfig.prototype.getAccountType = jest
        .fn()
        .mockReturnValue(ACCOUNT_TYPE_ENUM.GLIP);
      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(false);
    });
    it('GLIP user type and has token', () => {
      AccountUserConfig.prototype.getAccountType = jest
        .fn()
        .mockReturnValue(ACCOUNT_TYPE_ENUM.GLIP);
      AuthUserConfig.prototype.getGlipToken = jest
        .fn()
        .mockReturnValue('glip_token');
      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(true);
    });
  });

  describe('RC user', () => {
    it('RC user type but has not token', () => {
      AccountUserConfig.prototype.getAccountType = jest
        .fn()
        .mockReturnValue(ACCOUNT_TYPE_ENUM.RC);
      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(false);
    });
    it('RC user type and has token', () => {
      AuthUserConfig.prototype.getGlipToken = jest
        .fn()
        .mockReturnValue('glip_token');
      AuthUserConfig.prototype.getRcToken = jest
        .fn()
        .mockReturnValue('rc_token');
      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(true);
    });
  });
});
