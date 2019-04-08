/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-15 16:14:38
 * Copyright © RingCentral. All rights reserved.
 */

import { AuthController } from '../AuthController';
import {
  UnifiedLoginAuthenticator,
  RCPasswordAuthenticator,
} from '../../../../authenticator';
import notificationCenter from '../../../../service/notificationCenter';
import { SERVICE } from '../../../../service/eventKey';
import { RCAuthApi } from '../../../../api';
import { AuthUserConfig } from '../../config';
import { AUTH_GLIP2_TOKEN } from '../../../../dao/auth/constants';

jest.mock('foundation');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../config');
jest.mock('../../../../api/ringcentral/RCAuthApi');

describe('AuthService', () => {
  let authController: AuthController;
  const mockAccountManager = {
    login: jest.fn(),
    makeSureUserInWhitelist: jest.fn(),
    logout: jest.fn(),
    isLoggedIn: jest.fn(),
  } as any;

  beforeEach(() => {
    authController = new AuthController(mockAccountManager);
  });

  describe('unifiedLogin()', () => {
    it('should login by UnifiedLoginAuthenticator', async () => {
      await authController.unifiedLogin({ code: 'xxxxx', token: undefined });
      expect(mockAccountManager.login).toBeCalledWith(
        UnifiedLoginAuthenticator.name,
        { code: 'xxxxx', token: undefined },
      );
    });
  });

  describe('login()', () => {
    it('should login glip/glip2 and notify login', async () => {
      authController.onLogin = jest.fn();
      authController.loginGlip = jest.fn();
      authController.loginGlip2 = jest.fn();
      await authController.login({
        username: '123',
        extension: '123',
        password: 'abc',
      });
      expect(authController.onLogin).toBeCalled();
      expect(authController.loginGlip).toBeCalledWith({
        username: '123',
        extension: '123',
        password: 'abc',
      });
      expect(authController.loginGlip2).toBeCalledWith({
        username: '123',
        extension: '123',
        password: 'abc',
      });
    });
  });

  describe('onLogin()', () => {
    it('should notify login', () => {
      authController.onLogin();
      expect(notificationCenter.emitKVChange).toBeCalledWith(SERVICE.LOGIN);
    });
  });

  describe('loginGlip()', () => {
    it('should login with RCPasswordAuthenticator', async () => {
      await authController.loginGlip({
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

  describe('loginGlip2()', () => {
    it('should login glip2', async () => {
      RCAuthApi.loginGlip2ByPassword.mockReturnValueOnce('mockToken');
      await authController.loginGlip2({
        username: '123',
        extension: '123',
        password: 'abc',
      });
      expect(RCAuthApi.loginGlip2ByPassword).toBeCalledWith({
        username: '123',
        extension: '123',
        password: 'abc',
      });
      expect(AuthUserConfig.prototype.setGlip2Token).toBeCalledWith(
        'mockToken',
      );
      expect(notificationCenter.emitKVChange).toBeCalledWith(
        AUTH_GLIP2_TOKEN,
        'mockToken',
      );
    });
  });

  describe('makeSureUserInWhitelist()', () => {
    it('should not check white list when rc token is invalid', async () => {
      AuthUserConfig.prototype.getRCToken.mockReturnValueOnce({
        owner_id: undefined,
      });
      await authController.makeSureUserInWhitelist();
      expect(AuthUserConfig.prototype.getRCToken).toBeCalled();
      expect(mockAccountManager.makeSureUserInWhitelist).not.toBeCalled();
    });

    it('should check white list when rc token is valid', async () => {
      AuthUserConfig.prototype.getRCToken.mockReturnValueOnce({
        owner_id: 123,
      });
      await authController.makeSureUserInWhitelist();
      expect(AuthUserConfig.prototype.getRCToken).toBeCalled();
      expect(mockAccountManager.makeSureUserInWhitelist).toBeCalledWith(123);
    });
  });

  describe('logout()', () => {
    it('should do logout', async () => {
      authController.logout();
      expect(notificationCenter.emitKVChange).toBeCalledWith(SERVICE.LOGOUT);
      expect(mockAccountManager.logout).toBeCalled();
    });
  });

  describe('isLoggedIn()', () => {
    it('should return correct value', async () => {
      mockAccountManager.isLoggedIn.mockReturnValueOnce(true);
      expect(authController.isLoggedIn()).toBeTruthy();
      mockAccountManager.isLoggedIn.mockReturnValueOnce(false);
      expect(authController.isLoggedIn()).toBeFalsy();
    });
  });
});
