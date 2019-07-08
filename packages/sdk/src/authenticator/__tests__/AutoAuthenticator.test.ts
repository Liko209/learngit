/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 13:14:35
 * Copyright © RingCentral. All rights reserved
 */

import { AutoAuthenticator } from '../AutoAuthenticator';
import { ACCOUNT_TYPE_ENUM } from '../constants';
import { GlobalConfigService } from '../../module/config';
import { AccountGlobalConfig } from '../../module/account/config';
import { AuthUserConfig } from '../../module/account/config/AuthUserConfig';
import { AccountUserConfig } from '../../module/account/config/AccountUserConfig';
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
    expect(resp).toEqual({ success: false });
  });
  describe('GLIP user', () => {
    it('GLIP user type but has not token', () => {
      AccountUserConfig.prototype.getAccountType = jest
        .fn()
        .mockReturnValue(ACCOUNT_TYPE_ENUM.GLIP);
      const resp = autoAuthenticator.authenticate();
      expect(resp).toEqual({ success: false });
    });
    it('GLIP user type and has token', () => {
      AccountUserConfig.prototype.getAccountType = jest
        .fn()
        .mockReturnValue(ACCOUNT_TYPE_ENUM.GLIP);
      AuthUserConfig.prototype.getGlipToken = jest
        .fn()
        .mockReturnValue('glip_token');
      const resp = autoAuthenticator.authenticate();
      expect(resp).toEqual({
        success: true,
        isFirstLogin: false,
        accountInfos: [{ data: 'glip_token', type: 'GlipAccount' }],
      });
    });
  });

  describe('RC user', () => {
    it('RC user type but has not token', () => {
      AccountUserConfig.prototype.getAccountType = jest
        .fn()
        .mockReturnValue(ACCOUNT_TYPE_ENUM.RC);
      const resp = autoAuthenticator.authenticate();
      expect(resp).toEqual({ success: false });
    });
    it('RC user type and has token', () => {
      AuthUserConfig.prototype.getGlipToken = jest
        .fn()
        .mockReturnValue('glip_token');
      AuthUserConfig.prototype.getRCToken = jest
        .fn()
        .mockReturnValue('rc_token');
      const resp = autoAuthenticator.authenticate();
      expect(resp).toEqual({
        success: true,
        isFirstLogin: false,
        isRCOnlyMode: false,
        accountInfos: [
          { data: 'rc_token', type: 'RCAccount' },
          { data: 'glip_token', type: 'GlipAccount' },
        ],
      });
      expect(resp.accountInfos!.length).toEqual(2);
    });
    it('RC user type and only has rc token', () => {
      AuthUserConfig.prototype.getGlipToken = jest
        .fn()
        .mockReturnValue(undefined);
      AuthUserConfig.prototype.getRCToken = jest
        .fn()
        .mockReturnValue('rc_token');
      const resp = autoAuthenticator.authenticate();
      expect(resp).toEqual({
        success: true,
        isFirstLogin: false,
        isRCOnlyMode: true,
        accountInfos: [{ data: 'rc_token', type: 'RCAccount' }],
      });
    });
  });
});
