/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-29 20:02:23
 * Copyright © RingCentral. All rights reserved.
 */

import { AllCallLogFetchController } from '../AllCallLogFetchController';
import { mainLogger } from 'foundation';
import { CALL_LOG_SOURCE } from '../../constants';
import { RCItemApi } from 'sdk/api';
import { SYNC_TYPE } from 'sdk/module/RCItems/sync';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('AllLogFetchController', () => {
  let controller: AllCallLogFetchController;
  const mockSourceController = {
    getEntityNotificationKey: jest.fn(),
    bulkUpdate: jest.fn(),
  } as any;

  function setUp() {
    mainLogger.tags = jest.fn().mockReturnValue({ info: jest.fn() });
    controller = new AllCallLogFetchController({} as any, mockSourceController);
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('handleDataAndSave', () => {
    it('should return correct data', async () => {
      const mockTime = '2011-10-05T14:48:00.000Z';
      const mockData = { records: [{ id: '1', startTime: mockTime }] } as any;

      expect(await controller['handleDataAndSave'](mockData)).toEqual([
        {
          id: '1',
          startTime: mockTime,
          __source: CALL_LOG_SOURCE.ALL,
          __timestamp: Date.parse(mockTime),
          __deactivated: false,
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
      });
    });
  });
});
