/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-29 15:54:47
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractFetchController } from '../AbstractFetchController';
import { ERROR_MSG_RC, ERROR_CODES_RC } from 'sdk/error';
import { mainLogger } from 'foundation/log';
import { RCItemApi } from 'sdk/api';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { RCItemSyncController } from 'sdk/module/RCItems/sync';
import { CALL_RESULT, CALL_LOG_SOURCE } from '../../constants';
import { RCItemFetchController } from 'sdk/module/RCItems/common/controller/RCItemFetchController';
import { CALL_DIRECTION } from 'sdk/module/RCItems/constants';
import { daoManager } from 'sdk/dao';
import { CALL_LOG_POST_PERFORMANCE_KEYS } from '../../config/performanceKeys';

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

  describe('buildFilterFunc', () => {
    it('should filter valid data by source type', async () => {
      const mockData = [
        { id: '1', result: CALL_RESULT.MISSED, deleted: false },
        { id: '2', result: CALL_RESULT.VOICEMAIL, deleted: false },
        { id: '3', result: CALL_RESULT.UNKNOWN, deleted: false },
        { id: '4', result: CALL_RESULT.MISSED, deleted: true },
        { id: '5', result: CALL_RESULT.MISSED, deleted: false },
      ];
      RCItemFetchController.prototype.buildFilterFunc = jest
        .fn()
        .mockReturnValue((data: any) => {
          return data.id !== '5';
        });
      const filter = await controller.buildFilterFunc({
        callLogSource: CALL_LOG_SOURCE.MISSED,
      });
      expect(mockData.filter(filter)).toEqual([
        { id: '1', result: CALL_RESULT.MISSED, deleted: false },
        { id: '2', result: CALL_RESULT.VOICEMAIL, deleted: false },
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

  describe('getFilterInfo', () => {
    it('should get caller from call log', () => {
      expect(
        controller['getFilterInfo']({
          direction: CALL_DIRECTION.INBOUND,
          from: 'from',
          to: 'to',
        } as any),
      ).toEqual('from');
      expect(
        controller['getFilterInfo']({
          direction: CALL_DIRECTION.OUTBOUND,
          from: 'from',
          to: 'to',
        } as any),
      ).toEqual('to');
      expect(controller['getFilterInfo']({} as any)).toEqual({});
    });
  });

  describe('fetchDataFromDB', () => {
    it('should call dao', async () => {
      const mockFunc = jest.fn().mockReturnValue('data');
      daoManager.getDao = jest
        .fn()
        .mockReturnValue({ queryCallLogs: mockFunc });
      expect(await controller['fetchDataFromDB']({})).toEqual('data');
      expect(mockFunc).toBeCalled();
    });
  });

  describe('onDBFetchFinished', () => {
    it('should call performanceTracer', () => {
      const tracer = { trace: jest.fn() };
      controller['onDBFetchFinished']([{}, {}] as any, tracer as any);
      expect(tracer.trace).toBeCalledWith({
        key: CALL_LOG_POST_PERFORMANCE_KEYS.FETCH_CALL_LOG_FROM_DB,
        count: 2,
      });
    });
  });

  describe('onFetchFinished', () => {
    it('should call performanceTracer', () => {
      const tracer = { end: jest.fn() };
      controller['_badgeController'].handleCallLogs = jest.fn();
      controller['onFetchFinished']([{}, {}] as any, tracer as any);
      expect(tracer.end).toBeCalledWith({
        key: CALL_LOG_POST_PERFORMANCE_KEYS.FETCH_CALL_LOG,
        count: 2,
      });
      expect(controller['_badgeController'].handleCallLogs).toBeCalled();
    });
  });
});
