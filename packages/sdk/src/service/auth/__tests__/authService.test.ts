/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-28 20:06:33
 * Copyright © RingCentral. All rights reserved.
 */

import { AuthService } from '../authService';
import {
  UnifiedLoginAuthenticator,
  RCPasswordAuthenticator,
} from '../../../authenticator';
import notificationCenter from '../../notificationCenter';
import { SERVICE } from '../../eventKey';
import { RCAuthApi } from '../../../api';
import { AuthUserConfig } from '../config';

jest.mock('foundation');
jest.mock('../../notificationCenter');
jest.mock('../../auth/config');
jest.mock('../../../api/ringcentral/RCAuthApi');

describe('AuthService', () => {
  let authService: AuthService;
  const mockAccountManager = {
    login: jest.fn(),
    makeSureUserInWhitelist: jest.fn(),
    logout: jest.fn(),
    isLoggedIn: jest.fn(),
  } as any;

  beforeEach(() => {
    authService = new AuthService(mockAccountManager);
  });

  describe('unifiedLogin()', () => {
    it('should login by UnifiedLoginAuthenticator', async () => {
      await authService.unifiedLogin({ code: 'xxxxx', token: undefined });
      expect(mockAccountManager.login).toBeCalledWith(
        UnifiedLoginAuthenticator.name,
        { code: 'xxxxx', token: undefined },
      );
    });
  });

  describe('login()', () => {
    it('should login glip and notify login', async () => {
      authService.onLogin = jest.fn();
      authService.loginGlip = jest.fn();
      await authService.login({
        username: '123',
        extension: '123',
        password: 'abc',
      });
      expect(authService.onLogin).toBeCalled();
      expect(authService.loginGlip).toBeCalledWith({
        username: '123',
        extension: '123',
        password: 'abc',
      });
    });
  });

  describe('onLogin()', () => {
    it('should notify login', () => {
      authService.onLogin();
      expect(notificationCenter.emitKVChange).toBeCalledWith(SERVICE.LOGIN);
    });
  });

  describe('loginGlip()', () => {
    it('should login with RCPasswordAuthenticator', async () => {
      await authService.loginGlip({
        username: '123',
        extension: '123',
        password: 'abc',
      });
      expect(mockAccountManager.login).toBeCalledWith(
        RCPasswordAuthenticator.name,
        {
          username: '123',
          extension: '123',
          password: 'abc',
        },
      );
    });
  });

  describe('makeSureUserInWhitelist()', () => {
    it('should not check white list when rc token is invalid', async () => {
      AuthUserConfig.prototype.getRCToken.mockReturnValueOnce({
        owner_id: undefined,
      });
      await authService.makeSureUserInWhitelist();
      expect(AuthUserConfig.prototype.getRCToken).toBeCalled();
      expect(mockAccountManager.makeSureUserInWhitelist).not.toBeCalled();
    });

    it('should check white list when rc token is valid', async () => {
      AuthUserConfig.prototype.getRCToken.mockReturnValueOnce({
        owner_id: 123,
      });
      await authService.makeSureUserInWhitelist();
      expect(AuthUserConfig.prototype.getRCToken).toBeCalled();
      expect(mockAccountManager.makeSureUserInWhitelist).toBeCalledWith(123);
    });
  });

  describe('logout()', () => {
    it('should do logout', async () => {
      authService.logout();
      expect(notificationCenter.emitKVChange).toBeCalledWith(SERVICE.LOGOUT);
      expect(mockAccountManager.logout).toBeCalled();
    });
  });

  describe('isLoggedIn()', () => {
    it('should return correct value', async () => {
      mockAccountManager.isLoggedIn.mockReturnValueOnce(true);
      expect(authService.isLoggedIn()).toBeTruthy();
      mockAccountManager.isLoggedIn.mockReturnValueOnce(false);
      expect(authService.isLoggedIn()).toBeFalsy();
    });
  });
});
