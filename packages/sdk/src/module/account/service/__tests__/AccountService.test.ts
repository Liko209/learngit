/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 14:02:24
 */
/// <reference path="../../../__tests__/types.d.ts" />

import { AccountService } from '..';
import { PersonService } from '../../../person';
import { RCAuthApi } from '../../../../api';
import { AccountGlobalConfig } from '../../config';
import { AccountUserConfig } from '../../config/AccountUserConfig';
import { ServiceLoader } from '../../../serviceLoader';
import { setRCToken } from '../../../../authenticator/utils';
import { AuthUserConfig } from '../../config/AuthUserConfig';
import { generateUUID } from '../../../../utils/mathUtils';
jest.mock('../../../serviceLoader');
jest.mock('../../../person');
jest.mock('../../../../api');
jest.mock('../../../account/config/AccountUserConfig');
jest.mock('../../../account/config/AuthUserConfig');
jest.mock('../../../account/config');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('AccountService', () => {
  let accountService: AccountService;
  let personService: PersonService;

  function setUp() {
    personService = new PersonService();
    ServiceLoader.getInstance.mockReturnValue(personService);
    accountService = new AccountService(null as any);
    setRCToken = jest.fn();
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('getCurrentUserInfo()', () => {
    it('should return current user info', () => {
      expect.assertions(1);
      (personService.getById as jest.Mock).mockResolvedValueOnce({
        email: 'a@gmail.com',
        display_name: 'display_name',
      });
      AccountUserConfig.prototype.getGlipUserId = jest
        .fn()
        .mockReturnValue(222);

      const user = accountService.getCurrentUserInfo();
      return expect(user).resolves.toEqual({
        email: 'a@gmail.com',
        display_name: 'display_name',
      });
    });

    it('should return {} when not userId ', async () => {
      expect.assertions(1);

      AccountUserConfig.prototype.getGlipUserId = jest
        .fn()
        .mockReturnValue(null);
      const userInfo = await accountService.getCurrentUserInfo();
      return expect(userInfo).toEqual(null);
    });

    it('should return {} when not personInfo', () => {
      expect.assertions(1);
      (personService.getById as jest.Mock).mockResolvedValueOnce(null);
      const personInfo = accountService.getCurrentUserInfo();
      return expect(personInfo).resolves.toEqual(null);
    });
  });

  describe('getUserEmail', () => {
    it('should return correct email when has valid userInfo', async () => {
      accountService.getCurrentUserInfo = jest
        .fn()
        .mockResolvedValue({ email: 'jajaja' });
      expect(await accountService.getUserEmail()).toEqual('jajaja');
    });

    it('should return null when has invalid userInfo', async () => {
      accountService.getCurrentUserInfo = jest
        .fn()
        .mockResolvedValue(undefined);
      expect(await accountService.getUserEmail()).toEqual(null);
    });
  });

  describe('getClientId', () => {
    it('should return id directly when id is in userConfig', () => {
      accountService.userConfig.getClientId = jest
        .fn()
        .mockReturnValue('12345');
      expect(accountService.getClientId()).toEqual('12345');
    });

    it('should generate uuid when id is not in userConfig', () => {
      accountService.userConfig.getClientId = jest
        .fn()
        .mockReturnValue(undefined);
      generateUUID = jest.fn().mockReturnValue('155');
      expect(accountService.getClientId()).toEqual('155');
      expect(generateUUID).toBeCalled();
    });
  });

  describe('refreshRCToken()', () => {
    const result = {
      timestamp: 1,
      accessTokenExpireIn: 6001,
      refreshTokenExpireIn: 6001,
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };

    it('should refresh rc token if api return data', () => {
      RCAuthApi.refreshToken.mockResolvedValue(result);
      expect.assertions(1);
      const token = accountService.refreshRCToken();
      return expect(token).resolves.toEqual({
        timestamp: 1,
        accessTokenExpireIn: 6001,
        refreshTokenExpireIn: 6001,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });

    it('should refresh rc token if api return data', () => {
      RCAuthApi.refreshToken.mockResolvedValueOnce(result);
      expect.assertions(1);
      const token = accountService.refreshRCToken();
      return expect(token).resolves.toEqual({
        timestamp: 1,
        accessTokenExpireIn: 6001,
        refreshTokenExpireIn: 6001,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });

    it('should throw error when refresh token error', async () => {
      RCAuthApi.refreshToken.mockRejectedValueOnce('error2');
      expect.assertions(1);
      const result = await accountService.refreshRCToken().catch(reason => {
        expect(reason).toEqual('error2');
      });
    });

    it('should only refresh token once when has multiple request to refresh token', async () => {
      RCAuthApi.refreshToken.mockResolvedValueOnce(result);
      expect.assertions(9);
      const token1 = accountService.refreshRCToken();
      const token2 = accountService.refreshRCToken();
      const token3 = accountService.refreshRCToken();
      expect(accountService['_refreshTokenQueue']).toHaveLength(2);
      expect(accountService['_isRefreshingToken']).toBeTruthy();

      const res = await Promise.all([token1, token2, token3]);

      expect(RCAuthApi.refreshToken).toBeCalledTimes(1);
      expect(accountService['_refreshTokenQueue']).toEqual([]);
      expect(accountService['_isRefreshingToken']).toBeFalsy();
      expect(res[0]).toEqual(result);
      expect(res[1]).toEqual(result);
      expect(res[2]).toEqual(result);
      expect(setRCToken).toBeCalledTimes(1);
    });
  });

  describe('isGlipLogin', () => {
    it('should return false when user dictionary is not ready', () => {
      AccountGlobalConfig.getUserDictionary.mockReturnValue(null);
      expect(accountService.isGlipLogin()).toBe(false);
    });
    it('should return false when there is no glip user id', () => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      jest.restoreAllMocks();
      AccountGlobalConfig.getUserDictionary.mockReturnValue(1);
      AccountUserConfig.prototype.getGlipUserId.mockReturnValue(null);
      expect(accountService.isGlipLogin()).toBe(false);
    });
    it('should return true when glip user id is set', () => {
      AccountGlobalConfig.getUserDictionary.mockReturnValue(1);
      AccountUserConfig.prototype.getGlipUserId.mockReturnValue('123');
      expect(accountService.isGlipLogin()).toBe(true);
    });
  });

  describe('get rc token', () => {
    const accessToken = {
      access_token: 'access_token',
      endpoint_id: 'i6Kffo9iTCun9yEIOT7drQ',
      expires_in: 3600,
      timestamp: 1559613357949,
    };

    beforeEach(() => {
      AuthUserConfig.prototype.getRCToken = jest
        .fn()
        .mockReturnValue(accessToken);
    });

    it('should  not refresh token when token is invalid', async () => {
      accountService['refreshRCToken'] = jest.fn().mockResolvedValue({ id: 1 });
      Date.now = jest
        .fn()
        .mockReturnValue(1559613357949 + 3600 * 1000 - 5 * 60 * 1000);
      const result = await accountService.getRCToken();
      expect(accountService['refreshRCToken']).not.toBeCalled();
      expect(result).toEqual(accessToken);
    });

    it('should refresh token when token is invalid', async () => {
      accountService['refreshRCToken'] = jest.fn().mockResolvedValue({ id: 1 });
      Date.now = jest
        .fn()
        .mockReturnValue(1559613357949 + 3600 * 1000 - 5 * 60 * 1000 + 1);
      const result = await accountService.getRCToken();
      expect(accountService['refreshRCToken']).toBeCalled();
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('unifiedLogin', () => {
    it('should call auth controller', async () => {
      const mockFunc = jest.fn();
      accountService.getAuthController = jest.fn().mockReturnValue({
        unifiedLogin: mockFunc,
      });
      await accountService.unifiedLogin({});
      expect(mockFunc).toBeCalled();
    });
  });

  describe('loginGlip', () => {
    it('should call auth controller', async () => {
      const mockFunc = jest.fn();
      accountService.getAuthController = jest.fn().mockReturnValue({
        loginGlip: mockFunc,
      });
      await accountService.loginGlip({} as any);
      expect(mockFunc).toBeCalled();
    });
  });

  describe('makeSureUserInWhitelist', () => {
    it('should call auth controller', async () => {
      const mockFunc = jest.fn();
      accountService.getAuthController = jest.fn().mockReturnValue({
        makeSureUserInWhitelist: mockFunc,
      });
      await accountService.makeSureUserInWhitelist();
      expect(mockFunc).toBeCalled();
    });
  });

  describe('logout', () => {
    it('should call auth controller', async () => {
      const mockFunc = jest.fn();
      accountService.getAuthController = jest.fn().mockReturnValue({
        logout: mockFunc,
      });
      await accountService.logout();
      expect(mockFunc).toBeCalled();
    });
  });

  describe('isLoggedIn', () => {
    it('should call auth controller', async () => {
      const mockFunc = jest.fn();
      accountService.getAuthController = jest.fn().mockReturnValue({
        isLoggedIn: mockFunc,
      });
      await accountService.isLoggedIn();
      expect(mockFunc).toBeCalled();
    });
  });

  describe('isRCOnlyMode', () => {
    it('should call auth controller', async () => {
      const mockFunc = jest.fn();
      accountService.getAuthController = jest.fn().mockReturnValue({
        isRCOnlyMode: mockFunc,
      });
      await accountService.isRCOnlyMode();
      expect(mockFunc).toBeCalled();
    });
  });

  describe('startLoginGlip', () => {
    it('should call auth controller', async () => {
      const mockFunc = jest.fn();
      accountService.getAuthController = jest.fn().mockReturnValue({
        startLoginGlip: mockFunc,
      });
      await accountService.startLoginGlip();
      expect(mockFunc).toBeCalled();
    });
  });
});
