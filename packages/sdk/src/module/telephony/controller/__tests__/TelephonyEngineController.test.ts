/*
 * @Author: Lewi.Li
 * @Date: 2019-04-29 16:11:33
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyEngineController } from '../TelephonyEngineController';
import { notificationCenter } from '../../../../service';
import { GlobalConfigService } from '../../../config';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { AuthUserConfig } from '../../../account/config';

jest.mock('../../../config');

describe('', () => {
  let engineController: TelephonyEngineController;

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }
  beforeEach(() => {
    clearMocks();
    engineController = new TelephonyEngineController();
  });
  describe('getVoipCallPermission', () => {
    it('should return true when both rcinfo and ld has permission', async () => {
      ServiceLoader.getInstance = jest.fn().mockImplementation(service => {
        if (service === ServiceConfig.RC_INFO_SERVICE) {
          return {
            isVoipCallingAvailable: jest.fn().mockReturnValue(true),
          };
        }
        if (service === ServiceConfig.PERMISSION_SERVICE) {
          return { hasPermission: jest.fn().mockReturnValue(true) };
        }
      });
      const res = await engineController.getVoipCallPermission();
      expect(res).toBe(true);
    });

    it('should return false when neither rcinfo nor ld has permission', async () => {
      ServiceLoader.getInstance = jest.fn().mockImplementation(service => {
        if (service === ServiceConfig.RC_INFO_SERVICE) {
          return {
            isVoipCallingAvailable: jest.fn().mockReturnValue(false),
          };
        }
        if (service === ServiceConfig.PERMISSION_SERVICE) {
          return { hasPermission: jest.fn().mockReturnValue(false) };
        }
      });
      const res = await engineController.getVoipCallPermission();
      expect(res).toBe(false);
    });

    it('should return false if ld has no permission', async () => {
      ServiceLoader.getInstance = jest.fn().mockImplementation(service => {
        if (service === ServiceConfig.RC_INFO_SERVICE) {
          return {
            isVoipCallingAvailable: jest.fn().mockReturnValue(true),
          };
        }
        if (service === ServiceConfig.PERMISSION_SERVICE) {
          return { hasPermission: jest.fn().mockReturnValue(false) };
        }
      });
      const res = await engineController.getVoipCallPermission();
      expect(res).toBe(false);
    });
  });

  describe('onPermissionUpdated', () => {
    it('should emit notification when permission is changed and voip is available', async () => {
      Object.assign(engineController, {
        _isVoipCallingAvailable: false,
      });
      jest
        .spyOn(engineController, 'getVoipCallPermission')
        .mockReturnValueOnce(true);
      const spy = jest.spyOn(notificationCenter, 'emitKVChange');
      await engineController.onPermissionUpdated();
      expect(spy).toBeCalled();
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
      expect(spy1).not.toBeCalled();
      expect(spy2).not.toBeCalled();
    });

    it('should call logout when permission is chagned and voip is unavailable', async () => {
      Object.assign(engineController, {
        _preCallingPermission: true,
      });
      jest
        .spyOn(engineController, 'getVoipCallPermission')
        .mockReturnValueOnce(false);
      const spy = jest.spyOn(engineController, 'logout');
      await engineController.onPermissionUpdated();
      expect(spy).toBeCalled();
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
});
