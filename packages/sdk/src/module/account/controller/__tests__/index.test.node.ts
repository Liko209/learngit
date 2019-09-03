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
import { AuthUserConfig } from '../../config/AuthUserConfig';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { glipStatus } from 'sdk/api';
import { mainLogger } from 'foundation/log';
import { TaskController } from 'sdk/framework/controller/impl/TaskController';
import { ReLoginGlipStrategy } from '../../strategy/ReLoginGlipStrategy';
import { RCInfoService } from 'sdk/module/rcInfo';

jest.mock('../../../../service/notificationCenter');
jest.mock('../../config/AuthUserConfig');
jest.mock('../../../../api/ringcentral/RCAuthApi');
jest.mock('sdk/framework/controller/impl/TaskController');
jest.mock('../../strategy/ReLoginGlipStrategy');

describe('AuthService', () => {
  let authController: AuthController;
  const mockAccountManager = {
    login: jest.fn(),
    makeSureUserInWhitelist: jest.fn(),
    logout: jest.fn(),
    isLoggedIn: jest.fn(),
    isRCOnlyMode: jest.fn(),
    glipLogin: jest.fn(),
    setGlipLoginStatus: jest.fn(),
  } as any;

  const mockRCInfoService = {
    getRCExtensionInfo: jest.fn(),
    getUserEmail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    mainLogger.tags = jest
      .fn()
      .mockReturnValue({ error: jest.fn(), info: jest.fn() });
    authController = new AuthController(mockAccountManager);
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return { authUserConfig: AuthUserConfig.prototype };
        }

        if (config === ServiceConfig.RC_INFO_SERVICE) {
          return mockRCInfoService;
        }
      });
  });

  describe('unifiedLogin()', () => {
    it('should login by UnifiedLoginAuthenticator', async () => {
      await authController.unifiedLogin({ code: 'xxxxx', token: undefined });
      expect(mockAccountManager.login).toHaveBeenCalledWith(
        UnifiedLoginAuthenticator.name,
        { code: 'xxxxx', token: undefined },
      );
    });
  });

  describe('loginGlip()', () => {
    it('should login with RCPasswordAuthenticator', async () => {
      await authController.loginGlip({
        username: '123',
        extension: '123',
        password: 'abc',
      });
      expect(mockAccountManager.login).toHaveBeenCalledWith(
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
    it('should not check white list when email prefix is valid', async () => {
      AuthUserConfig.prototype.getRCToken.mockReturnValueOnce({
        owner_id: undefined,
      });

      mockRCInfoService.getRCExtensionInfo.mockReturnValueOnce({contact: {
        email: "",
      }});

      await authController.makeSureUserInWhitelist();
      expect(AuthUserConfig.prototype.getRCToken).toHaveBeenCalled();
      expect(mockAccountManager.makeSureUserInWhitelist).not.toHaveBeenCalled();
    });

    it('should check white list when user id and email prefix are valid', async () => {
      AuthUserConfig.prototype.getRCToken.mockReturnValueOnce({
        owner_id: 123,
      });

      mockRCInfoService.getUserEmail.mockReturnValueOnce(
        "freda.song@ringcentral.com");

      await authController.makeSureUserInWhitelist();
      expect(mockAccountManager.makeSureUserInWhitelist).toHaveBeenCalledWith("ringcentral.com", 123);
    });

    it('should check white list when user id is valid', async () => {
      AuthUserConfig.prototype.getRCToken.mockReturnValueOnce({
        owner_id: 123,
      });

      mockRCInfoService.getUserEmail.mockReturnValueOnce(
        "");

      await authController.makeSureUserInWhitelist();
      expect(mockAccountManager.makeSureUserInWhitelist).toHaveBeenCalledWith("", 123);
    });
  });

  describe('logout()', () => {
    it('should do logout', async () => {
      authController.logout();
      expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(SERVICE.LOGOUT);
      expect(mockAccountManager.logout).toHaveBeenCalled();
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

  describe('isRCOnlyMode()', () => {
    it('should return correct value', async () => {
      mockAccountManager.isRCOnlyMode.mockReturnValueOnce(true);
      expect(authController.isRCOnlyMode()).toBeTruthy();
      mockAccountManager.isRCOnlyMode.mockReturnValueOnce(false);
      expect(authController.isRCOnlyMode()).toBeFalsy();
    });
  });

  describe('startLoginGlip()', () => {
    it('should call job scheduler', () => {
      authController.startLoginGlip();
      expect(TaskController).toHaveBeenCalled();
      expect(ReLoginGlipStrategy).toHaveBeenCalled();
      expect(TaskController.prototype.start).toHaveBeenCalled();
    });
  });

  describe('GlipLoginFunc()', () => {
    it('should do nothing when status is not OK', async () => {
      glipStatus = jest.fn().mockResolvedValue('error');
      await authController.GlipLoginFunc().catch(err => {
        expect(err).not.toBeUndefined();
      });
      expect(glipStatus).toHaveBeenCalled();
      expect(mockAccountManager.glipLogin).not.toHaveBeenCalled();
    });

    it('should login when status is OK', async () => {
      glipStatus = jest.fn().mockResolvedValue('OK');
      mockAccountManager.glipLogin.mockResolvedValue(true);
      await authController.GlipLoginFunc();
      expect(glipStatus).toHaveBeenCalled();
      expect(mockAccountManager.glipLogin).toHaveBeenCalled();
      expect(notificationCenter.emitKVChange).not.toHaveBeenCalled();
    });

    it('should emit glip_login with false when login failed', async () => {
      glipStatus = jest.fn().mockResolvedValue('OK');
      mockAccountManager.glipLogin.mockResolvedValue(false);
      await authController.GlipLoginFunc().catch(err => {
        expect(err).not.toBeUndefined();
      });
      expect(glipStatus).toHaveBeenCalled();
      expect(mockAccountManager.glipLogin).toHaveBeenCalled();
      expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(
        SERVICE.GLIP_LOGIN,
        { success: false, isFirstLogin: true },
      );
    });

    it('should emit glip_login with false when login crashed', async () => {
      glipStatus = jest.fn().mockResolvedValue('OK');
      mockAccountManager.glipLogin.mockImplementation(() => {
        throw 'error';
      });
      await authController.GlipLoginFunc().catch(err => {
        expect(err).not.toBeUndefined();
      });
      expect(glipStatus).toHaveBeenCalled();
      expect(mockAccountManager.glipLogin).toHaveBeenCalled();
      expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(
        SERVICE.GLIP_LOGIN,
        { success: false, isFirstLogin: true },
      );
    });
  });
});
