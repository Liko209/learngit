/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 13:14:35
 * Copyright © RingCentral. All rights reserved
 */

import { AutoAuthenticator } from '../AutoAuthenticator';
import { daoManager } from '../../dao';
import { ACCOUNT_TYPE_ENUM } from '../constants';
import { GlobalConfigService } from '../../module/config';
import { NewGlobalConfig } from '../../service/config/NewGlobalConfig1';
import { AuthGlobalConfig } from '../../service/auth/config';

jest.mock('../../module/config');
jest.mock('../../service/config/NewGlobalConfig1');
jest.mock('../../service/auth/config');

GlobalConfigService.getInstance = jest.fn();

describe('AutoAuthenticator', () => {
  const autoAuthenticator = new AutoAuthenticator(daoManager);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('user has not loggin', () => {
    const resp = autoAuthenticator.authenticate();
    expect(resp.success).toBe(false);
  });
  describe('GLIP user', () => {
    it('GLIP user type but has not token', () => {
      NewGlobalConfig.getAccountType = jest
        .fn()
        .mockReturnValue(ACCOUNT_TYPE_ENUM.GLIP);

      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(false);
    });
    it('GLIP user type and has token', () => {
      NewGlobalConfig.getAccountType = jest
        .fn()
        .mockReturnValue(ACCOUNT_TYPE_ENUM.GLIP);
      AuthGlobalConfig.getGlipToken = jest.fn().mockReturnValue('glip_token');
      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(true);
    });
  });

  describe('RC user', () => {
    it('RC user type but has not token', () => {
      NewGlobalConfig.getAccountType = jest
        .fn()
        .mockReturnValue(ACCOUNT_TYPE_ENUM.RC);
      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(false);
    });
    it('RC user type and has token', () => {
      AuthGlobalConfig.getGlipToken = jest.fn().mockReturnValue('glip_token');
      AuthGlobalConfig.getRcToken = jest.fn().mockReturnValue('rc_token');
      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(true);
    });
  });
});
