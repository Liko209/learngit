/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 14:02:24
 */
/// <reference path="../../../__tests__/types.d.ts" />
import { ResultOk } from 'foundation';
import AccountService from '..';
import { daoManager, AccountDao, PersonDao } from '../../../dao';
import { refreshToken } from '../../../api';

jest.mock('../../../dao');
jest.mock('../../../api');

describe('AccountService', () => {
  let accountService: AccountService;
  let accountDao: AccountDao;
  let personDao: PersonDao;

  beforeAll(() => {
    accountDao = new AccountDao(null);
    personDao = new PersonDao(null);
    daoManager.getDao.mockReturnValue(personDao);
    daoManager.getKVDao.mockReturnValue(accountDao);
    accountService = new AccountService();
  });

  beforeEach(() => {
    accountDao.get.mockClear();
  });

  describe('getCurrentUserInfo()', () => {
    it('should return current user info', () => {
      expect.assertions(1);
      accountDao.get.mockClear();
      accountDao.get.mockReturnValueOnce(1).mockReturnValueOnce(222);
      personDao.get.mockReturnValueOnce({
        id: 1,
        email: 'a@gmail.com',
        display_name: 'display_name',
      });

      const user = accountService.getCurrentUserInfo();
      return expect(user).resolves.toEqual({
        email: 'a@gmail.com',
        display_name: 'display_name',
        company_id: 222,
      });
    });

    it('should return {} when not userId ', () => {
      expect.assertions(1);
      accountDao.get.mockReturnValueOnce('').mockReturnValueOnce('123');
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
