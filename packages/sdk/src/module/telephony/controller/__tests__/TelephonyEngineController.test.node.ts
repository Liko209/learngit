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
    it('should return true when no sip prov', () => {
      accountController.getSipProv = jest.fn().mockReturnValue(null);
      const res = engineController.isEmergencyAddrConfirmed();
      expect(res).toBeTruthy();
    });
    it('should return false when no emergency addr in sip prov', () => {
      accountController.getSipProv = jest.fn().mockReturnValue('test');
      engineController.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue(undefined);
      const res = engineController.isEmergencyAddrConfirmed();
      expect(res).toBeFalsy();
    });
    it('should return false when no emergency addr saved in local', () => {
      accountController.getSipProv = jest.fn().mockReturnValue('test');
      engineController.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue('test');
      engineController.getLocalEmergencyAddress = jest.fn();
      const res = engineController.isEmergencyAddrConfirmed();
      expect(res).toBeFalsy();
    });
    it('should return true when both sip prov and local storage have emergency address saved', () => {
      accountController.getSipProv = jest.fn().mockReturnValue('test');
      engineController.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue('test');
      engineController.getLocalEmergencyAddress = jest
        .fn()
        .mockReturnValue('test');
      const res = engineController.isEmergencyAddrConfirmed();
      expect(res).toBeTruthy();
    });
  });

  describe('getLocalEmergencyAddress', () => {
    it('should get emergency address from config', () => {
      TelephonyGlobalConfig.getEmergencyAddress = jest.fn();
      engineController.getLocalEmergencyAddress();
      expect(TelephonyGlobalConfig.getEmergencyAddress).toHaveBeenCalled();
    });
  });

  describe('getRemoteEmergencyAddress', () => {
    it('should call controller to get emergency address', () => {
      accountController.getEmergencyAddress = jest.fn();
      engineController.getRemoteEmergencyAddress();
      expect(accountController.getEmergencyAddress).toHaveBeenCalled();
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
