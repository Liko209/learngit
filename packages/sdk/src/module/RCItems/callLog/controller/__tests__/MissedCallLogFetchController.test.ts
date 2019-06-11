/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-29 20:02:23
 * Copyright © RingCentral. All rights reserved.
 */

import { MissedCallLogFetchController } from '../MissedCallLogFetchController';
import { mainLogger } from 'foundation';
import { daoManager } from 'sdk/dao';
import { CALL_LOG_SOURCE } from '../../constants';
import { RCItemApi } from 'sdk/api';
import { SYNC_TYPE } from 'sdk/module/RCItems/sync';
import { ServiceLoader } from 'sdk/module/serviceLoader';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('MissedCallLogFetchController', () => {
  let controller: MissedCallLogFetchController;
  const mockSourceController = {
    getEntityNotificationKey: jest.fn(),
    bulkPut: jest.fn(),
    clear: jest.fn(),
  } as any;
  const mockUserConfig = {
    getPseudoCallLogInfo: jest.fn(),
    setPseudoCallLogInfo: jest.fn(),
  } as any;

  function setUp() {
    ServiceLoader.getInstance = jest
      .fn()
      .mockReturnValue({ userConfig: mockUserConfig });
    mainLogger.tags = jest.fn().mockReturnValue({ info: jest.fn() });
    controller = new MissedCallLogFetchController(
      {} as any,
      mockSourceController,
      {} as any,
    );
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('handleDataAndSave', () => {
    it('should return correct data', async () => {
      const mockTime1 = '2011-10-05T14:48:00.000Z';
      const mockTime2 = '2011-10-05T15:48:00.000Z';
      const mockData = {
        records: [
          { id: '1', startTime: mockTime1 },
          { id: '2', startTime: mockTime2 },
        ],
        syncInfo: {
          syncType: SYNC_TYPE.ISYNC,
        },
      } as any;
      const mockQueryTime = jest.fn().mockReturnValue(1317826080001);
      daoManager.getDao = jest.fn().mockReturnValue({
        queryOldestTimestamp: mockQueryTime,
      });

      expect(await controller['handleDataAndSave'](mockData)).toEqual([
        {
          id: '1',
          startTime: mockTime1,
          __source: CALL_LOG_SOURCE.MISSED,
          __timestamp: Date.parse(mockTime1),
          __deactivated: false,
        },
      ]);
    });

    it('should clear data when sync type is FSYNC', async () => {
      const mockTime1 = '2011-10-05T14:48:00.000Z';
      const mockTime2 = '2011-10-05T15:48:00.000Z';
      const mockData = {
        records: [
          { id: '1', startTime: mockTime1 },
          { id: '2', startTime: mockTime2 },
        ],
        syncInfo: {
          syncType: SYNC_TYPE.FSYNC,
        },
      } as any;
      daoManager.getDao = jest.fn();

      expect(await controller['handleDataAndSave'](mockData)).toEqual([
        {
          id: '1',
          startTime: mockTime1,
          __source: CALL_LOG_SOURCE.MISSED,
          __timestamp: Date.parse(mockTime1),
          __deactivated: false,
        },
        {
          id: '2',
          startTime: mockTime2,
          __source: CALL_LOG_SOURCE.MISSED,
          __timestamp: Date.parse(mockTime2),
          __deactivated: false,
        },
      ]);
      expect(mockSourceController.clear).toBeCalled();
      expect(mockUserConfig.setPseudoCallLogInfo).toBeCalledWith({});
    });
  });

  describe('sendSyncRequest', () => {
    it('should call api', async () => {
      RCItemApi.syncCallLog = jest.fn();
      await controller['sendSyncRequest'](SYNC_TYPE.FSYNC);
      expect(RCItemApi.syncCallLog).toBeCalledWith({
        syncType: SYNC_TYPE.FSYNC,
        statusGroup: CALL_LOG_SOURCE.MISSED,
      });
    });
  });
});
