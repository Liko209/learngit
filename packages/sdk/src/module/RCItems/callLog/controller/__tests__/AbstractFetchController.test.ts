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

  function setUp() {
    mainLogger.tags = jest.fn().mockReturnValue({ info: jest.fn() });
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

      expect(await controller.fetchCallLogs(CALL_LOG_SOURCE.ALL)).toEqual({
        data: [mockData],
        hasMore: true,
      });
    });

    it('should get data from remote when local does not have data', async () => {
      const mockData = { id: 'test' };
      const mockQueryCallLogs = jest.fn().mockResolvedValue([]);
      daoManager.getDao = jest.fn().mockReturnValue({
        queryCallLogs: mockQueryCallLogs,
      });
      mockConfig.getHasMore.mockReturnValue(false);
      controller.doSync = jest.fn().mockResolvedValue([mockData]);

      expect(await controller.fetchCallLogs(CALL_LOG_SOURCE.ALL)).toEqual({
        data: [mockData],
        hasMore: false,
      });
      expect(mockBadgeController.handleCallLogs).toBeCalledWith([mockData]);
    });
  });

  describe('isTokenInvalidError', () => {
    it('should return false when reason is empty', async () => {
      const reason = undefined as any;
      expect(controller['isTokenInvalidError'](reason)).toBeFalsy();
    });

    it('should return true when reason is CLG_101', async () => {
      const reason = {
        message: ERROR_MSG_RC.SYNC_TOKEN_INVALID_ERROR_MSG,
        code: ERROR_CODES_RC.CLG_101,
      } as any;
      expect(controller['isTokenInvalidError'](reason)).toBeTruthy();
    });

    it('should return true when reason is CLG_102', async () => {
      const reason = {
        message: ERROR_MSG_RC.SYNC_TOKEN_INVALID_ERROR_MSG,
        code: ERROR_CODES_RC.CLG_102,
      } as any;
      expect(controller['isTokenInvalidError'](reason)).toBeTruthy();
    });

    it('should return true when reason is CLG_104', async () => {
      const reason = {
        message: ERROR_MSG_RC.SYNC_TOKEN_INVALID_ERROR_MSG,
        code: ERROR_CODES_RC.CLG_104,
      } as any;
      expect(controller['isTokenInvalidError'](reason)).toBeTruthy();
    });
  });

  describe('requestClearAllAndRemoveLocalData', () => {
    it('should call api and source controller', async () => {
      RCItemApi.deleteAllCallLogs = jest.fn();
      await controller['requestClearAllAndRemoveLocalData']();
      expect(RCItemApi.deleteAllCallLogs).toBeCalled();
      expect(mockSourceController.clear).toBeCalled();
    });
  });
});
