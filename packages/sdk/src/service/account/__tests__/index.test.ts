/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 14:02:24
 */
/// <reference path="../../../__tests__/types.d.ts" />
import { ResultOk } from 'foundation';
import AccountService from '..';
import { daoManager, AccountDao } from '../../../dao';
import { PersonDao } from '../../../module/person/dao';
import { refreshToken } from '../../../api';
import { GlobalConfigService } from '../../../module/config/service/GlobalConfigService';
import { AccountGlobalConfig } from '../../../service/account/config';
import { UserConfigService } from '../../../module/config';
import { AuthGlobalConfig } from '../../../service/auth/config';

jest.mock('../../../dao');
jest.mock('../../../module/person/dao');
jest.mock('../../../api');
jest.mock('../../../module/config');
jest.mock('../../../service/account/config');
GlobalConfigService.getInstance = jest.fn();
UserConfigService.getInstance = jest.fn();
AccountGlobalConfig.getInstance = jest.fn();

describe('AccountService', () => {
  let accountService: AccountService;
  let accountDao: AccountDao;
  let personDao: PersonDao;
  let accountConfig: AccountGlobalConfig;

  beforeAll(() => {
    accountDao = new AccountDao(null);
    personDao = new PersonDao(null);
    daoManager.getDao.mockReturnValue(personDao);
    accountConfig = new AccountGlobalConfig(null);
    AccountGlobalConfig.getInstance = jest.fn().mockReturnValue(accountConfig);
    accountService = new AccountService();
  });

  beforeEach(() => {
    accountDao.get.mockClear();
  });

  describe('getCurrentUserInfo()', () => {
    it('should return current user info', () => {
      expect.assertions(1);
      personDao.get.mockReturnValueOnce({
        id: 1,
        email: 'a@gmail.com',
        display_name: 'display_name',
      });

      accountConfig.getCurrentCompanyId = jest.fn().mockReturnValue(222);
      accountConfig.getCurrentUserId = jest.fn().mockReturnValue(222);

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
      accountDao.get.mockClear();
      accountDao.get.mockReturnValueOnce('12').mockReturnValueOnce('123');
      personDao.get.mockReturnValueOnce('');
      const personInfo = accountService.getCurrentUserInfo();
      return expect(personInfo).resolves.toEqual({});
    });
  });

  describe('refreshRCToken()', () => {
    it('should refresh rc roken if api return data', () => {
      const result = new ResultOk({
        timestamp: 1,
        accessTokenExpireIn: 6001,
        refreshTokenExpireIn: 6001,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      refreshToken.mockResolvedValue(result);
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
      const result = new ResultOk({
        timestamp: 1,
        accessTokenExpireIn: 6001,
        refreshTokenExpireIn: 6001,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      refreshToken.mockResolvedValueOnce(result);
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

    it('should not refresh rc token if api return error', () => {
      refreshToken.mockRejectedValueOnce('error');
      expect.assertions(1);
      const token = accountService.refreshRCToken();
      return expect(token).resolves.toEqual(null);
    });
  });
});
