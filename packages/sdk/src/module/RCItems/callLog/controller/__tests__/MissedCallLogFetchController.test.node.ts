/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-29 20:02:23
 * Copyright © RingCentral. All rights reserved.
 */

import { MissedCallLogFetchController } from '../MissedCallLogFetchController';
import { mainLogger } from 'foundation/log';
import { daoManager } from 'sdk/dao';
import { CALL_LOG_SOURCE, LOCAL_INFO_TYPE } from '../../constants';
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
          __localInfo:
            LOCAL_INFO_TYPE.IS_INBOUND |
            LOCAL_INFO_TYPE.IS_MISSED |
            LOCAL_INFO_TYPE.IS_MISSED_SOURCE,
          __timestamp: Date.parse(mockTime1),
        },
      ]);
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
