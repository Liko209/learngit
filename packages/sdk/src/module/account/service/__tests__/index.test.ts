/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 14:02:24
 */
/// <reference path="../../../__tests__/types.d.ts" />

import { AccountService } from '..';
import { daoManager } from '../../../../dao';
import { PersonDao } from '../../../person/dao';
import { RCAuthApi } from '../../../../api';
import {
  AccountUserConfig,
  AccountGlobalConfig,
} from '../../../account/config';

jest.mock('../../../../dao');
jest.mock('../../../person/dao');
jest.mock('../../../../api');
jest.mock('../../../account/config');

describe('AccountService', () => {
  let accountService: AccountService;
  let personDao: PersonDao;

  beforeAll(() => {
    personDao = new PersonDao(null);
    daoManager.getDao.mockReturnValue(personDao);
    accountService = new AccountService(null);
  });

  describe('getCurrentUserInfo()', () => {
    it('should return current user info', () => {
      expect.assertions(1);
      personDao.get.mockReturnValueOnce({
        id: 1,
        email: 'a@gmail.com',
        display_name: 'display_name',
      });
      AccountUserConfig.prototype.getGlipUserId = jest
        .fn()
        .mockReturnValue(222);
      AccountUserConfig.prototype.getCurrentCompanyId = jest
        .fn()
        .mockReturnValue(222);

      const user = accountService.getCurrentUserInfo();
      return expect(user).resolves.toEqual({
        email: 'a@gmail.com',
        display_name: 'display_name',
        company_id: 222,
      });
    });

    it('should return {} when not userId ', () => {
      expect.assertions(1);
      const userInfo = accountService.getCurrentUserInfo();
      return expect(userInfo).resolves.toEqual({});
    });

    it('should return {} when not personInfo', () => {
      expect.assertions(1);
      personDao.get.mockReturnValueOnce('');
      const personInfo = accountService.getCurrentUserInfo();
      return expect(personInfo).resolves.toEqual({});
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
