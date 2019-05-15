/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 14:02:24
 */
/// <reference path="../../../__tests__/types.d.ts" />

import { AccountService } from '..';
import { PersonService } from '../../../person';
import { RCAuthApi } from '../../../../api';
import {
  AccountUserConfig,
  AccountGlobalConfig,
} from '../../../account/config';
import { ServiceLoader } from '../../../serviceLoader';

// jest.mock('../../../../dao');
jest.mock('../../../serviceLoader');
jest.mock('../../../person');
jest.mock('../../../../api');
jest.mock('../../../account/config');

describe('AccountService', () => {
  let accountService: AccountService;
  let personService: PersonService;

  beforeEach(() => {
    personService = new PersonService();
    ServiceLoader.getInstance.mockReturnValue(personService);
    accountService = new AccountService(null);
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

  describe('refreshRCToken()', () => {
    it('should refresh rc roken if api return data', () => {
      const result = {
        timestamp: 1,
        accessTokenExpireIn: 6001,
        refreshTokenExpireIn: 6001,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };
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
      const result = {
        timestamp: 1,
        accessTokenExpireIn: 6001,
        refreshTokenExpireIn: 6001,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };
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

    it('should not refresh rc token if api return error', async () => {
      RCAuthApi.refreshToken.mockRejectedValueOnce('error');
      expect.assertions(1);
      try {
        await accountService.refreshRCToken();
      } catch (err) {
        expect(err).toEqual('error');
      }
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
});
