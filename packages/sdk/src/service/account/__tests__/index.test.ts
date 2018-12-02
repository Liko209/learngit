/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 14:02:24
 */
/// <reference path="../../../__tests__/types.d.ts" />
import { ResultOk } from 'foundation';
import AccountService from '..';
import { daoManager, AccountDao, PersonDao } from '../../../dao';
import { ACCOUNT_CONVERSATION_LIST_LIMITS } from '../../../dao/account/constants';

import { refreshToken } from '../../../api';
import { GROUP_QUERY_TYPE } from '../../constants';
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

  it('getCurrentUserId()', () => {
    accountDao.get.mockReturnValue(111);
    const userId = accountService.getCurrentUserId();
    expect(userId).toBe(111);

    accountDao.get.mockReturnValue('');
    const userIdNull = accountService.getCurrentUserId();
    expect(userIdNull).toBeNull();
  });

  it('getCurrentUserProfileId()', () => {
    accountDao.get.mockReturnValue(111);
    const profileId = accountService.getCurrentUserProfileId();
    expect(profileId).toBe(111);

    accountDao.get.mockReturnValue('');
    const profileIdNull = accountService.getCurrentUserProfileId();
    expect(profileIdNull).toBeNull();
  });

  it('getCurrentCompanyId()', () => {
    accountDao.get.mockReturnValue(111);
    const companyId = accountService.getCurrentCompanyId();
    expect(companyId).toBe(111);

    accountDao.get.mockReturnValue('');
    const companyIdNull = accountService.getCurrentCompanyId();
    expect(companyIdNull).toBeNull();
  });

  it('getCurrentUserInfo() if not userId should be {}', () => {
    expect.assertions(1);
    accountDao.get.mockReturnValueOnce('').mockReturnValueOnce('123');
    const userInfo = accountService.getCurrentUserInfo();
    return expect(userInfo).resolves.toEqual({});
  });

  it('getCurrentUserInfo() if not personInfo should be {}', () => {
    expect.assertions(1);
    accountDao.get.mockClear();
    accountDao.get.mockReturnValueOnce('12').mockReturnValueOnce('123');
    personDao.get.mockReturnValueOnce('');
    const personInfo = accountService.getCurrentUserInfo();
    return expect(personInfo).resolves.toEqual({});
  });

  it('getCurrentUserInfo()', () => {
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
