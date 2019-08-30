/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-29 20:02:23
 * Copyright © RingCentral. All rights reserved.
 */

import { AllCallLogFetchController } from '../AllCallLogFetchController';
import { mainLogger } from 'foundation/log';
import { CALL_RESULT, LOCAL_INFO_TYPE } from '../../constants';
import { RCItemApi } from 'sdk/api';
import { SYNC_TYPE } from 'sdk/module/RCItems/sync';
import { notificationCenter } from 'sdk/service';
import { CALL_DIRECTION } from 'sdk/module/RCItems/constants';
import { daoManager } from 'sdk/dao';

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
    bulkDelete: jest.fn(),
    bulkPut: jest.fn(),
    clear: jest.fn(),
  } as any;
  const mockUserConfig = {
    getPseudoCallLogInfo: jest.fn(),
    setPseudoCallLogInfo: jest.fn(),
  } as any;

  function setUp() {
    mainLogger.tags = jest.fn().mockReturnValue({ info: jest.fn() });
    controller = new AllCallLogFetchController(
      mockUserConfig,
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
      const mockTime = '2011-10-05T14:48:00.000Z';
      const mockData = {
        records: [
          {
            id: '1',
            startTime: mockTime,
            sessionId: 'sessionId1',
            result: CALL_RESULT.MISSED,
          },
          { id: '2', startTime: mockTime, direction: CALL_DIRECTION.OUTBOUND },
          {
            id: '3',
            startTime: mockTime,
            sessionId: 'sessionId3',
            result: CALL_RESULT.VOICEMAIL,
            deleted: true,
          },
        ],
        syncInfo: {
          syncType: SYNC_TYPE.ISYNC,
        },
      } as any;
      mockUserConfig.getPseudoCallLogInfo.mockReturnValue({
        sessionId1: { id: 'pseudo1' },
      });
      notificationCenter.emitEntityReplace = jest.fn();

      expect(await controller['handleDataAndSave'](mockData)).toEqual([
        {
          id: '1',
          startTime: mockTime,
          sessionId: 'sessionId1',
          result: CALL_RESULT.MISSED,
          __localInfo: LOCAL_INFO_TYPE.IS_INBOUND | LOCAL_INFO_TYPE.IS_MISSED,
          __timestamp: Date.parse(mockTime),
          deleted: false,
        },
        {
          id: '2',
          startTime: mockTime,
          direction: CALL_DIRECTION.OUTBOUND,
          __localInfo: 0,
          __timestamp: Date.parse(mockTime),
          deleted: false,
        },
        {
          id: '3',
          startTime: mockTime,
          sessionId: 'sessionId3',
          deleted: true,
          result: CALL_RESULT.VOICEMAIL,
          __localInfo: 3,
          __timestamp: 1317826080000,
        },
      ]);
      expect(mockSourceController.bulkDelete).toHaveBeenCalledWith([
        'pseudo1',
        '3',
      ]);
      expect(mockUserConfig.setPseudoCallLogInfo).toHaveBeenCalledWith({});
    });
  });

  describe('sendSyncRequest', () => {
    it('should call api to do FSync without deleted data', async () => {
      RCItemApi.syncCallLog = jest.fn();
      await controller['sendSyncRequest'](SYNC_TYPE.FSYNC);
      expect(RCItemApi.syncCallLog).toHaveBeenCalledWith({
        syncType: SYNC_TYPE.FSYNC,
        showDeleted: false,
      });
    });

    it('should call api to do ISync with deleted data', async () => {
      RCItemApi.syncCallLog = jest.fn();
      await controller['sendSyncRequest'](SYNC_TYPE.ISYNC);
      expect(RCItemApi.syncCallLog).toHaveBeenCalledWith({
        syncType: SYNC_TYPE.ISYNC,
        showDeleted: true,
      });
    });
  });

  describe('fetchAllUniquePhoneNumberCalls', () => {
    it('should call queryAllUniquePhoneNumberCalls', async () => {
      const calls = [{ id: '1' }];
      daoManager.getDao = jest.fn().mockReturnValue({
        queryAllUniquePhoneNumberCalls: jest.fn().mockResolvedValue(calls),
      });

      const result = await controller.fetchAllUniquePhoneNumberCalls();
      expect(result).toEqual(calls);
    });
  });
});
