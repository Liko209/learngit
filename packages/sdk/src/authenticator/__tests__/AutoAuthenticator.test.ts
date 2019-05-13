/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 13:14:35
 * Copyright © RingCentral. All rights reserved
 */

import { AutoAuthenticator } from '../AutoAuthenticator';
import { ACCOUNT_TYPE_ENUM } from '../constants';
import { GlobalConfigService } from '../../module/config';
import {
  AccountUserConfig,
  AccountGlobalConfig,
  AuthUserConfig,
} from '../../module/account/config';
import { ServiceLoader, ServiceConfig } from '../../module/serviceLoader';

jest.mock('../../module/config');
jest.mock('../../module/account/config');

GlobalConfigService.getInstance = jest.fn();

describe('AutoAuthenticator', () => {
  const autoAuthenticator = new AutoAuthenticator();

  beforeEach(() => {
    jest.clearAllMocks();
    AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValue('12');
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return {
            userConfig: AccountUserConfig.prototype,
            authUserConfig: AuthUserConfig.prototype,
          };
        }
      });
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
      AuthUserConfig.prototype.getRCToken = jest
        .fn()
        .mockReturnValue('rc_token');
      const resp = autoAuthenticator.authenticate();
      expect(resp.success).toBe(true);
      expect(resp.accountInfos!.length).toBe(2);
    });
    it('RC user type and only has rc token', () => {
      AuthUserConfig.prototype.getGlipToken = jest
        .fn()
        .mockReturnValue(undefined);
      AuthUserConfig.prototype.getRCToken = jest
        .fn()
        .mockReturnValue('rc_token');
      const resp = autoAuthenticator.authenticate();

      // todo: for now, ui can not support the rc only mode
      // so will return false to logout when glip is down
      expect(resp.success).toBe(false);
    });
  });
});
