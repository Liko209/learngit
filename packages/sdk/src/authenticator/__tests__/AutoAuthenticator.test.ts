/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 13:14:35
 * Copyright © RingCentral. All rights reserved
 */

import { AutoAuthenticator } from '../AutoAuthenticator';
import { daoManager } from '../../dao';
import { ACCOUNT_TYPE, ACCOUNT_TYPE_ENUM } from '../constants';
import { AUTH_GLIP_TOKEN, AUTH_RC_TOKEN } from '../../dao/auth/constants';
import { GlobalConfigService } from '../../module/config';
import { NewGlobalConfig } from '../../service/config/newGlobalConfig';
import { AuthGlobalConfig } from '../../service/auth/config';

jest.mock('../../module/config');
jest.mock('../../service/config/newGlobalConfig');
jest.mock('../../service/auth/config');

GlobalConfigService.getInstance = jest.fn();

describe('AutoAuthenticator', () => {
  const autoAuthenticator = new AutoAuthenticator(daoManager);
  const authConfig = new AuthGlobalConfig(null);
  const newConfig = new NewGlobalConfig(null);

  beforeEach(() => {
    AuthGlobalConfig.getInstance = jest.fn().mockReturnValue(authConfig);
    NewGlobalConfig.getInstance = jest.fn().mockReturnValue(newConfig);
  });

  describe('user has not loggin', () => {
    NewGlobalConfig.getInstance = jest.fn().mockReturnValue(newConfig);
    const resp = autoAuthenticator.authenticate();
    expect(resp.success).toBe(false);
  });
  describe('GLIP user', () => {
    it('GLIP user type but has not token', () => {
      newConfig.getAccountType = jest
        .fn()
        .mockReturnValue(ACCOUNT_TYPE_ENUM.GLIP);

      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(false);
    });
    it('GLIP user type and has token', () => {
      const config = new NewGlobalConfig(null);
      config.getAccountType = jest
        .fn()
        .mockReturnValue('ACCOUNT_TYPE_ENUM.GLIP');
      authConfig.getGlipToken = jest.fn().mockReturnValue('glip_token');
      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(true);
    });
  });

  describe('RC user', () => {
    it('RC user type but has not token', () => {
      newConfig.getAccountType = jest
        .fn()
        .mockReturnValue(ACCOUNT_TYPE_ENUM.RC);
      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(false);
    });
    it('RC user type and has token', () => {
      authConfig.getGlipToken = jest.fn().mockReturnValue('glip_token');
      authConfig.getRcToken = jest.fn().mockReturnValue('rc_token');
      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(true);
    });
  });
});
