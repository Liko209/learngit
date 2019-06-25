/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-29 15:54:47
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractFetchController } from '../AbstractFetchController';
import { daoManager } from 'sdk/dao';
import { CALL_LOG_SOURCE } from '../../constants';
import { ERROR_MSG_RC, ERROR_CODES_RC } from 'sdk/error';
import { mainLogger } from 'foundation';
import { RCItemApi } from 'sdk/api';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { RCItemSyncController } from 'sdk/module/RCItems/sync';

class TestFetchController extends AbstractFetchController {
  handleDataAndSave = jest.fn();
  sendSyncRequest = jest.fn();
}

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('AbstractFetchController', () => {
  let controller: TestFetchController;
  const mockConfig = {
    getHasMore: jest.fn(),
  };
  const mockSourceController = {
    getEntityNotificationKey: jest.fn(),
    clear: jest.fn(),
  };
  const mockBadgeController = {
    handleCallLogs: jest.fn(),
  };
  const mockCallLogService = {
    userConfig: {
      setPseudoCallLogInfo: jest.fn(),
    },
    resetFetchControllers: jest.fn(),
  };
  const mockRCInfoService = {
    isRCFeaturePermissionEnabled: jest.fn(),
    isVoipCallingAvailable: jest.fn(),
  };

  function setUp() {
    mainLogger.tags = jest.fn().mockReturnValue({ info: jest.fn() });
    ServiceLoader.getInstance = jest.fn().mockImplementation((data: string) => {
      if (data === ServiceConfig.CALL_LOG_SERVICE) {
        return mockCallLogService;
      }
      if (data === ServiceConfig.RC_INFO_SERVICE) {
        return mockRCInfoService;
      }
      return;
    });
    controller = new TestFetchController(
      'test',
      mockConfig as any,
      mockSourceController as any,
      mockBadgeController as any,
    );
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('fetchCallLogs', () => {
    it('should get data from dao', async () => {
      const mockData = { id: 'test' };
      const mockQueryCallLogs = jest.fn().mockResolvedValue([mockData]);
      daoManager.getDao = jest.fn().mockReturnValue({
        queryCallLogs: mockQueryCallLogs,
      });
      mockConfig.getHasMore.mockReturnValue(false);

      expect(
        await controller.fetchCallLogs(CALL_LOG_SOURCE.ALL, undefined, 1),
      ).toEqual({
        data: [mockData],
        hasMore: true,
      });
    });

    it('should get data from remote when local does not have enough data', async () => {
      const mockData = { id: 'test' };
      const mockQueryCallLogs = jest.fn().mockResolvedValue([mockData]);
      daoManager.getDao = jest.fn().mockReturnValue({
        queryCallLogs: mockQueryCallLogs,
      });
      mockConfig.getHasMore.mockReturnValue(true);
      controller.doSync = jest.fn().mockResolvedValue([mockData]);

      expect(await controller.fetchCallLogs(CALL_LOG_SOURCE.ALL)).toEqual({
        data: [mockData, mockData],
        hasMore: true,
      });
      expect(mockBadgeController.handleCallLogs).toBeCalledWith([
        mockData,
        mockData,
      ]);
    });
  });

  describe('isTokenInvalidError', () => {
    it('should return false when reason is empty', async () => {
      const reason = undefined as any;
      expect(controller['isTokenInvalidError'](reason)).toBeFalsy();
    });

    it('should return true when reason is CLG_101', async () => {
      const reason = {
        code: ERROR_CODES_RC.CLG_101,
      } as any;
      expect(controller['isTokenInvalidError'](reason)).toBeTruthy();
    });

    it('should return true when reason is CLG_102', async () => {
      const reason = {
        code: ERROR_CODES_RC.CLG_102,
      } as any;
      expect(controller['isTokenInvalidError'](reason)).toBeTruthy();
    });

    it('should return true when reason is CLG_104', async () => {
      const reason = {
        code: ERROR_CODES_RC.CLG_104,
      } as any;
      expect(controller['isTokenInvalidError'](reason)).toBeTruthy();
    });

    it('should return true when reason has correct error message', async () => {
      const reason = {
        message: ERROR_MSG_RC.SYNC_TOKEN_INVALID_ERROR_MSG,
      } as any;
      expect(controller['isTokenInvalidError'](reason)).toBeTruthy();
    });
  });

  describe('requestClearAllAndRemoveLocalData', () => {
    it('should call api and clear local data', async () => {
      RCItemApi.deleteAllCallLogs = jest.fn();
      controller['removeLocalData'] = jest.fn();

      await controller['requestClearAllAndRemoveLocalData']();
      expect(RCItemApi.deleteAllCallLogs).toBeCalled();
      expect(controller['removeLocalData']).toBeCalled();
    });
  });

  describe('removeLocalData', () => {
    it('should call source controller and config', async () => {
      await controller['removeLocalData']();
      expect(mockSourceController.clear).toBeCalled();
      expect(mockCallLogService.userConfig.setPseudoCallLogInfo).toBeCalled();
    });
  });

  describe('hasPermission', () => {
    it('should return false when call permission is disabled', async () => {
      mockRCInfoService.isVoipCallingAvailable.mockReturnValue(false);
      mockRCInfoService.isRCFeaturePermissionEnabled.mockReturnValue(true);
      expect(await controller['hasPermission']()).toBeFalsy();
    });

    it('should return false when callLog permission is disabled', async () => {
      mockRCInfoService.isVoipCallingAvailable.mockReturnValue(true);
      mockRCInfoService.isRCFeaturePermissionEnabled.mockReturnValue(false);
      expect(await controller['hasPermission']()).toBeFalsy();
    });

    it('should return true when callLog/call permission is enabled', async () => {
      mockRCInfoService.isVoipCallingAvailable.mockReturnValue(true);
      mockRCInfoService.isRCFeaturePermissionEnabled.mockReturnValue(true);
      expect(await controller['hasPermission']()).toBeTruthy();
    });
  });

  describe('reset', () => {
    it('should call resetFetchControllers', async () => {
      await controller.reset();
      expect(mockCallLogService.resetFetchControllers).toBeCalled();
    });
  });

  describe('internalReset', () => {
    it('should call super reset', async () => {
      RCItemSyncController.prototype.reset = jest.fn();

      await controller.internalReset();
      expect(RCItemSyncController.prototype.reset).toBeCalled();
    });
  });
});
