/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-28 22:08:52
 * Copyright © RingCentral. All rights reserved.
 */

import { CallLogService } from '../CallLogService';
import { CallLogController } from '../../controller/CallLogController';
import { RCItemUserConfig } from 'sdk/module/RCItems/config';
import { CALL_LOG_SOURCE, MODULE_NAME } from '../../constants';
import { CallLogUserConfig } from '../../config/CallLogUserConfig';

jest.mock('../../../config');
jest.mock('../../config/CallLogUserConfig');
jest.mock('../../controller/CallLogController', () => {
  const xx = {
    callLogActionController: {
      deleteCallLogs: jest.fn(),
      clearUnreadMissedCall: jest.fn(),
    },
    allCallLogFetchController: {
      clearAll: jest.fn(),
      requestSync: jest.fn(),
      fetchData: jest.fn(),
      internalReset: jest.fn(),
      fetchAllUniquePhoneNumberCalls: jest.fn(),
      buildFilterFunc: jest.fn(),
    },
    missedCallLogFetchController: {
      requestSync: jest.fn(),
      fetchData: jest.fn(),
      internalReset: jest.fn(),
    },
    callLogHandleDataController: {
      handleMissedCallEvent: jest.fn(),
      handleRCPresenceEvent: jest.fn(),
    },
    callLogBadgeController: {
      initializeUnreadCount: jest.fn(),
    },
  };
  return {
    CallLogController: () => {
      return xx;
    },
  };
});

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('CallLogService', () => {
  let callLogService: CallLogService;
  let callLogController: CallLogController;
  function setUp() {
    callLogController = new CallLogController(
      null as any,
      null as any,
      null as any,
    );
    callLogService = new CallLogService();
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('userConfig', () => {
    it('should get userConfig', async () => {
      const config = callLogService['userConfig'];
      expect(config instanceof CallLogUserConfig).toBeTruthy();
      expect(CallLogUserConfig).toBeCalledWith(
        `${MODULE_NAME}.${CALL_LOG_SOURCE.ALL}`,
      );
    });
  });

  describe('missedCallUserConfig', () => {
    it('should get missedCallUserConfig', async () => {
      const config = callLogService['missedCallUserConfig'];
      expect(config instanceof RCItemUserConfig).toBeTruthy();
      expect(RCItemUserConfig).toBeCalledWith(
        `${MODULE_NAME}.${CALL_LOG_SOURCE.MISSED}`,
      );
    });
  });

  describe('requestSyncNewer', () => {
    it('should call all fetch controller', async () => {
      await callLogService.requestSyncNewer();
      expect(
        callLogController.allCallLogFetchController.requestSync,
      ).toBeCalled();
    });
  });

  describe('buildFilterFunc', () => {
    it('should call all fetch controller', async () => {
      await callLogService.buildFilterFunc({});
      expect(
        callLogController.allCallLogFetchController.buildFilterFunc,
      ).toBeCalled();
    });
  });

  describe('fetchCallLogs', () => {
    it('should call all fetch controller when source is all', async () => {
      await callLogService.fetchCallLogs({});
      expect(
        callLogController.allCallLogFetchController.fetchData,
      ).toBeCalled();
    });

    it('should call missed fetch controller when source is missed', async () => {
      await callLogService.fetchCallLogs({
        callLogSource: CALL_LOG_SOURCE.MISSED,
      });
      expect(
        callLogController.missedCallLogFetchController.fetchData,
      ).toBeCalled();
    });
  });

  describe('clearUnreadMissedCall', () => {
    it('clearUnreadMissedCall', async () => {
      await callLogService.clearUnreadMissedCall();
      expect(
        callLogController.callLogActionController.clearUnreadMissedCall,
      ).toBeCalled();
    });
  });

  describe('deleteCallLogs', () => {
    it('deleteCallLogs', async () => {
      const ids = ['1', '2', '3'];
      await callLogService.deleteCallLogs(ids);
      expect(
        callLogController.callLogActionController.deleteCallLogs,
      ).toBeCalledWith(ids);
    });
  });

  describe('clearAllCallLogs', () => {
    it('clearAllCallLogs', async () => {
      await callLogService.clearAllCallLogs();
      expect(callLogController.allCallLogFetchController.clearAll).toBeCalled();
    });
  });

  describe('fetchRecentCallLogs', () => {
    it('fetchRecentCallLogs', async () => {
      await callLogService.fetchRecentCallLogs();
      expect(
        callLogController.allCallLogFetchController
          .fetchAllUniquePhoneNumberCalls,
      ).toBeCalled();
    });
  });

  describe('resetFetchControllers', () => {
    it('resetFetchControllers', async () => {
      await callLogService.resetFetchControllers();
      expect(
        callLogController.allCallLogFetchController.internalReset,
      ).toBeCalled();
      expect(
        callLogController.missedCallLogFetchController.internalReset,
      ).toBeCalled();
    });
  });

  describe('getTotalCount', () => {
    it('getTotalCount', async () => {
      const mockFunc = jest.fn().mockReturnValue(5);
      callLogService.getEntitySource = jest
        .fn()
        .mockReturnValue({ getTotalCount: mockFunc });
      expect(await callLogService.getTotalCount()).toEqual(5);
      expect(mockFunc).toBeCalled();
    });
  });

  describe('_handleMissedCallEvent', () => {
    it('_handleMissedCallEvent', async () => {
      const mockData = 'mockData' as any;
      await callLogService['_handleMissedCallEvent'](mockData);
      expect(
        callLogController.callLogHandleDataController.handleMissedCallEvent,
      ).toBeCalled();
    });
  });

  describe('_handleRCPresenceEvent', () => {
    it('_handleRCPresenceEvent', async () => {
      const mockData = 'mockData' as any;
      await callLogService['_handleRCPresenceEvent'](mockData);
      expect(
        callLogController.callLogHandleDataController.handleRCPresenceEvent,
      ).toBeCalled();
    });
  });

  describe('_initBadge', () => {
    it('_initBadge', async () => {
      await callLogService['_initBadge']();
      expect(
        callLogController.callLogBadgeController.initializeUnreadCount,
      ).toBeCalled();
    });
  });
});
