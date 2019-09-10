/*
 * @Author: Lewi.Li
 * @Date: 2019-04-29 16:11:33
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyEngineController } from '../TelephonyEngineController';
import { notificationCenter } from '../../../../service';
import { GlobalConfigService } from '../../../config';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { AuthUserConfig } from '../../../account/config/AuthUserConfig';
import { AccountService } from 'sdk/module/account';
import { TelephonyUserConfig } from '../../config/TelephonyUserConfig';
import { RCInfoService } from 'sdk/module/rcInfo';
import { TelephonyAccountController } from '../TelephonyAccountController';
import { TelephonyGlobalConfig } from '../../config/TelephonyGlobalConfig';

jest.mock('../../../config');
jest.unmock('ua-parser-js');

const mockIsVoipCallingAvailable = jest.fn();
const mockGetRCBrandId = jest.fn();
const mockGetRCAccountId = jest.fn();
const mockGetRCExtensionId = jest.fn();

describe('TelephonyEngineController', () => {
  let engineController: TelephonyEngineController;
  const mockHasPermission = jest.fn();
  let accountController: TelephonyAccountController;

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }
  beforeEach(() => {
    clearMocks();
    engineController = new TelephonyEngineController();
    accountController = {};
    Object.assign(engineController, {
      _accountController: accountController,
    });
    ServiceLoader.getInstance = jest.fn().mockImplementation(service => {
      if (service === ServiceConfig.RC_INFO_SERVICE) {
        return {
          isVoipCallingAvailable: mockIsVoipCallingAvailable,
          getRCBrandId: mockGetRCBrandId,
          getRCAccountId: mockGetRCAccountId,
          getRCExtensionId: mockGetRCExtensionId,
        };
      }
      if (service === ServiceConfig.PERMISSION_SERVICE) {
        return { hasPermission: mockHasPermission };
      }
      if (service === ServiceConfig.ACCOUNT_SERVICE) {
        return { authUserConfig: AuthUserConfig.prototype };
      }
    });
  });
  describe('getVoipCallPermission', () => {
    it('should return true when both rcinfo and ld has permission', async () => {
      mockIsVoipCallingAvailable.mockReturnValue(true);
      mockHasPermission.mockReturnValue(true);
      const res = await engineController.getVoipCallPermission();
      expect(res).toBe(true);
    });

    it('should return false when neither rcinfo nor ld has permission', async () => {
      mockIsVoipCallingAvailable.mockReturnValue(false);
      mockHasPermission.mockReturnValue(false);
      const res = await engineController.getVoipCallPermission();
      expect(res).toBe(false);
    });

    it('should return false if ld has no permission', async () => {
      mockIsVoipCallingAvailable.mockReturnValue(true);
      mockHasPermission.mockReturnValue(false);
      const res = await engineController.getVoipCallPermission();
      expect(res).toBe(false);
    });
  });

  describe('onPermissionUpdated', () => {
    it('should emit notification when permission is changed and voip is available', async () => {
      Object.assign(engineController, {
        _isVoipCallingAvailable: false,
        rtcEngine: { setUserInfo: jest.fn() },
      });
      AuthUserConfig.prototype.getRCToken = jest.fn().mockReturnValueOnce({
        endpoint_id: 'test',
      });
      jest
        .spyOn(engineController, 'getVoipCallPermission')
        .mockReturnValueOnce(true);
      const spy = jest.spyOn(notificationCenter, 'emitKVChange');
      await engineController.onPermissionUpdated();
      expect(spy).toHaveBeenCalled();
    });

    it('should not emit notification when no permission is changed', async () => {
      Object.assign(engineController, {
        _preCallingPermission: true,
      });
      jest
        .spyOn(engineController, 'getVoipCallPermission')
        .mockReturnValueOnce(true);
      const spy1 = jest.spyOn(engineController, 'logout');
      const spy2 = jest.spyOn(notificationCenter, 'emitKVChange');
      await engineController.onPermissionUpdated();
      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
    });

    it('should call logout when permission is changed and voip is unavailable', async () => {
      Object.assign(engineController, {
        _preCallingPermission: true,
      });
      jest
        .spyOn(engineController, 'getVoipCallPermission')
        .mockReturnValueOnce(false);
      accountController.logout = jest.fn();
      const spy = jest.spyOn(engineController, 'logout');
      await engineController.onPermissionUpdated();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getEndpointId', () => {
    it('should return the endpoint id which is in rc token', () => {
      AuthUserConfig.prototype.getRCToken = jest.fn().mockReturnValueOnce({
        endpoint_id: 'test',
      });
      const result = engineController.getEndpointId();
      expect(result).toBe('test');
    });
  });

  describe('isEmergencyAddrConfirmed', () => {
    it('should call account controller', () => {
      accountController.isEmergencyAddrConfirmed = jest
        .fn()
        .mockReturnValue(true);
      const res = engineController.isEmergencyAddrConfirmed();
      expect(res).toBeTruthy();
    });
  });

  describe('createAccount', () => {
    beforeEach(() => {
      Object.assign(engineController, {
        rtcEngine: {
          setUserInfo: jest.fn(),
          createAccount: jest.fn()
        },
      });
      engineController.getUserInfo = jest.fn();
      jest
        .spyOn(engineController, 'getVoipCallPermission')
        .mockReturnValueOnce(true);
    })
    it('should not create multiple account', async () => {
      await engineController.createAccount();
      expect(engineController.getAccountController()).toBe(accountController);
    })

    it('should create account when no account is there', async () => {
      engineController._accountController = undefined;
      await engineController.createAccount();
      expect(engineController.getAccountController).not.toBeUndefined();
    });
  })

  describe('getRemoteEmergencyAddress', () => {
    it('should call account controller to get address', () => {
      accountController.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue('test');
      const res = engineController.getRemoteEmergencyAddress();
      expect(res).toBe('test');
    });
  });

  describe('hasActiveDL', () => {
    it('should return true when getRemoteEmergencyAddress return not empty', () => {
      engineController.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue('test');
      const res = engineController.hasActiveDL();
      expect(res).toBeTruthy();
    });
    it('should return false when getRemoteEmergencyAddress return empty', () => {
      engineController.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue('');
      const res = engineController.hasActiveDL();
      expect(res).toBeFalsy();
    });
  });

  describe('getLocalEmergencyAddress', () => {
    it('should call account controller to get address', () => {
      accountController.getLocalEmergencyAddress = jest
        .fn()
        .mockReturnValue('test');
      const res = engineController.getLocalEmergencyAddress();
      expect(res).toBe('test');
    });
  });

  describe('isAddressEqual', () => {
    it('should call with correct parameters', () => {
      accountController.isAddressEqual = jest.fn().mockReturnValue(true);
      const addr1 = { a: 'a' };
      const addr2 = { b: 'b' };
      const res = engineController.isAddressEqual(addr1, addr2);
      expect(accountController.isAddressEqual).toHaveBeenCalledWith(
        addr1,
        addr2,
      );
      expect(res).toBeTruthy();
    });
  });

  describe('getUserInfo()', () => {
    it('should call corresponding api when get user info', async () => {
      AuthUserConfig.prototype.getRCToken = jest.fn().mockReturnValueOnce({
        endpoint_id: 'test',
      });
      const spy = jest.spyOn(engineController, 'getEndpointId');
      await engineController.getUserInfo();
      expect(mockGetRCBrandId).toHaveBeenCalled();
      expect(mockGetRCAccountId).toHaveBeenCalled();
      expect(mockGetRCExtensionId).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });
});
