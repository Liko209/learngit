/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-15 16:14:38
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />

import {
  loginGlip,
  loginGlip2ByPassword,
  loginRCByPassword,
  Api,
} from '../../../api';
import {
  generateCode,
  oauthTokenViaAuthCode,
} from '../../../api/ringcentral/auth';
import { AuthDao, daoManager } from '../../../dao';
import { SERVICE } from '../../eventKey';
import notificationCenter from '../../notificationCenter';
import serviceManager from '../../serviceManager';
import AuthService from '..';
import { AccountManager } from '../../../framework';
import { AuthUserConfig } from '../../auth/config';

jest.mock('foundation');
jest.mock('../../../api');
jest.mock('../../../api/ringcentral/auth');
jest.mock('../../../dao');
jest.mock('../../notificationCenter');
jest.mock('../../../framework');
jest.mock('../../auth/config');

const accountManager: AccountManager = new AccountManager(null);
const authService: AuthService = new AuthService(accountManager);

describe('AuthService', () => {
  let authDao: AuthDao;

  beforeAll(() => {
    // mock Api.httpConfig
    Object.defineProperty(Api, 'httpConfig', {
      get() {
        return { rc: {}, glip: {}, glip2: {}, upload: {} };
      },
    });

    authDao = new AuthDao(null);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    authDao.get.mockReturnValue('__token__');
    daoManager.getKVDao.mockReturnValue(authDao);
    oauthTokenViaAuthCode.mockReturnValue({ data: {} });
    generateCode.mockResolvedValue({ data: { code: 1 } });
    loginGlip.mockResolvedValue({
      status: 1,
      data: {},
      headers: {
        'x-authorization': 'auth-token',
      },
    });
    loginRCByPassword.mockResolvedValue({ data: {} });
    loginGlip2ByPassword.mockResolvedValue({ data: {} });
  });

  describe('unifiedLogin()', () => {
    beforeEach(async () => {
      await authService.unifiedLogin({ code: 'xxxxx' });
    });
  });

  describe('login()', () => {
    describe('when everything is fine', () => {
      beforeEach(async () => {
        await authService.login({
          username: '123',
          extension: '123',
          password: 'abc',
        });
      });

      it('should call accountManager.login', () => {
        expect(accountManager.login).toHaveBeenCalled();
      });
    });

    describe('when glip2 fail', () => {
      // Glip2 is not used now. So, if it failed, we don't treat the login() as failed
      it('should login successfully', async () => {
        loginGlip2ByPassword.mockReset();
        loginGlip2ByPassword.mockImplementation(() => {
          throw new Error('test error');
        });
        await authService.login({
          username: '123',
          extension: '123',
          password: 'abc',
        });

        expect(loginGlip2ByPassword).toHaveBeenCalledWith({
          password: 'abc',
          extension: '123',
          username: '123',
        });
      });
    });
  });

  describe('logout()', () => {
    beforeAll(async () => {
      serviceManager.destroy = jest.fn();
      daoManager.deleteDatabase = jest.fn();
    });

    beforeEach(async () => {
      await authService.logout();
    });

    it('should emit event', () => {
      expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(
        SERVICE.LOGOUT,
      );
    });
  });

  describe('isLoggedIn()', () => {
    beforeEach(() => {
      daoManager.getKVDao(AuthDao).get.mockClear();
    });
    it('should call accountManger.isLoggedIn()', () => {
      authService.isLoggedIn();
      expect(accountManager.isLoggedIn).toHaveBeenCalled();
    });
  });
});
