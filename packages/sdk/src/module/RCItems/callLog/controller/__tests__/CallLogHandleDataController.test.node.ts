/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-06-05 13:42:31
 * Copyright © RingCentral. All rights reserved.
 */

import { CallLogHandleDataController } from '../CallLogHandleDataController';
import { CALL_RESULT } from '../../constants';
import { notificationCenter } from 'sdk/service';
import { CALL_DIRECTION } from 'sdk/module/RCItems/constants';
import { TELEPHONY_STATUS } from 'sdk/module/rcEventSubscription/constants';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

describe('CallLogHandleDataController', () => {
  let controller: CallLogHandleDataController;
  const mockConfig = {
    getSyncToken: jest.fn(),
    getPseudoCallLogInfo: jest.fn(),
    setPseudoCallLogInfo: jest.fn(),
  } as any;
  const mockSourceController = {
    update: jest.fn(),
    bulkUpdate: jest.fn(),
    getEntityNotificationKey: jest.fn(),
  } as any;
  const mockAccountService = {
    userConfig: {
      getGlipUserId: jest.fn(),
    },
  } as any;
  const mockPersonService = {
    getById: jest.fn(),
    getPhoneNumbers: jest.fn(),
  } as any;
  const mockNotificationController = {
    onReceivedNotification: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    ServiceLoader.getInstance = jest.fn().mockImplementation((data: string) => {
      if (data === ServiceConfig.ACCOUNT_SERVICE) {
        return mockAccountService;
      }
      if (data === ServiceConfig.PERSON_SERVICE) {
        return mockPersonService;
      }
      return;
    });
    controller = new CallLogHandleDataController(
      mockConfig,
      mockSourceController,
      mockNotificationController,
    );
  });

  describe('handleMissedCallEvent', () => {
    it('should do nothing when can not get sync token', async () => {
      mockConfig.getSyncToken.mockReturnValue(undefined);
      const mockData = {
        timestamp: 'time',
        sessionId: 'id',
        extensionId: 123,
      } as any;

      await controller.handleMissedCallEvent(mockData);
      expect(mockConfig.getPseudoCallLogInfo).not.toHaveBeenCalled();
    });

    it('should do nothing when can not get sessionId', async () => {
      mockConfig.getSyncToken.mockReturnValue('token');
      const mockData = {
        timestamp: 'time',
        extensionId: 123,
      } as any;

      await controller.handleMissedCallEvent(mockData);
      expect(mockConfig.getPseudoCallLogInfo).not.toHaveBeenCalled();
    });

    it('should do nothing when can not get timestamp', async () => {
      mockConfig.getSyncToken.mockReturnValue('token');
      const mockData = {
        sessionId: 'id',
        extensionId: 123,
      } as any;

      await controller.handleMissedCallEvent(mockData);
      expect(mockConfig.getPseudoCallLogInfo).not.toHaveBeenCalled();
    });

    it('should do nothing when can not get extensionId', async () => {
      mockConfig.getSyncToken.mockReturnValue('token');
      const mockData = {
        timestamp: 'time',
        sessionId: 'id',
        extensionId: -1,
      } as any;

      await controller.handleMissedCallEvent(mockData);
      expect(mockConfig.getPseudoCallLogInfo).not.toHaveBeenCalled();
    });

    it('should do nothing when already has pseudo missed call', async () => {
      mockConfig.getSyncToken.mockReturnValue('token');
      mockConfig.getPseudoCallLogInfo.mockReturnValue({
        id: {
          result: CALL_RESULT.MISSED,
        },
      });
      const mockData = {
        timestamp: 'time',
        sessionId: 'id',
        extensionId: 10,
      } as any;
      controller['_getCallLogBySessionId'] = jest.fn();

      await controller.handleMissedCallEvent(mockData);
      expect(controller['_getCallLogBySessionId']).not.toHaveBeenCalled();
    });

    it('should do nothing when already has db missed call', async () => {
      mockConfig.getSyncToken.mockReturnValue('token');
      mockConfig.getPseudoCallLogInfo.mockReturnValue({
        id: {
          result: CALL_RESULT.BUSY,
        },
      });
      const mockData = {
        timestamp: 'time',
        sessionId: 'id',
        extensionId: 10,
      } as any;
      controller['_getCallLogBySessionId'] = jest.fn().mockReturnValue({
        result: CALL_RESULT.MISSED,
      });
      controller['_getCallLogFromMissedCall'] = jest.fn();

      await controller.handleMissedCallEvent(mockData);
      expect(controller['_getCallLogFromMissedCall']).not.toHaveBeenCalled();
    });

    it('should parse and save/notify pseudo data, JPT-2504', async () => {
      mockConfig.getSyncToken.mockReturnValue('token');
      mockConfig.getPseudoCallLogInfo.mockReturnValue({
        id: {
          result: CALL_RESULT.BUSY,
        },
      });
      const mockData = {
        timestamp: 'time',
        sessionId: 'id',
        extensionId: 10,
      } as any;
      controller['_getCallLogBySessionId'] = jest.fn().mockReturnValue({
        result: CALL_RESULT.STOPPED,
      });
      notificationCenter.emitEntityUpdate = jest.fn();

      await controller.handleMissedCallEvent(mockData);
      expect(mockConfig.setPseudoCallLogInfo).toHaveBeenCalledWith({
        id: {
          id: `id${CALL_DIRECTION.INBOUND}`,
          result: CALL_RESULT.MISSED,
        },
      });
      expect(
        mockSourceController.bulkUpdate.mock.calls[0][0][0],
      ).toHaveProperty('__isPseudo', true);
      expect(
        mockNotificationController.onReceivedNotification,
      ).toHaveBeenCalled();
    });

    it('should parse and save/notify pseudo data for anonymous number', async () => {
      mockConfig.getSyncToken.mockReturnValue('token');
      mockConfig.getPseudoCallLogInfo.mockReturnValue({
        id: {
          result: CALL_RESULT.BUSY,
        },
      });
      const mockData = {
        timestamp: 'time',
        sessionId: 'id',
        extensionId: 10,
        from: 'anonymous',
      } as any;
      controller['_getCallLogBySessionId'] = jest.fn().mockReturnValue({
        result: CALL_RESULT.STOPPED,
      });
      notificationCenter.emitEntityUpdate = jest.fn();

      await controller.handleMissedCallEvent(mockData);
      expect(mockConfig.setPseudoCallLogInfo).toHaveBeenCalledWith({
        id: {
          id: `id${CALL_DIRECTION.INBOUND}`,
          result: CALL_RESULT.MISSED,
        },
      });
      expect(
        mockSourceController.bulkUpdate.mock.calls[0][0][0],
      ).toHaveProperty('__isPseudo', true);
      expect(
        mockSourceController.bulkUpdate.mock.calls[0][0][0],
      ).toHaveProperty('from', undefined);
      expect(
        mockNotificationController.onReceivedNotification,
      ).toHaveBeenCalled();
    });
  });

  describe('handleRCPresenceEvent', () => {
    it('should do nothing when can not get sync token', async () => {
      controller['_isSelfCall'] = jest.fn().mockResolvedValue(false);
      mockConfig.getSyncToken.mockReturnValue(undefined);
      const mockData = {
        activeCalls: [],
      } as any;

      await controller.handleRCPresenceEvent(mockData);
      expect(mockConfig.getPseudoCallLogInfo).not.toHaveBeenCalled();
    });

    it('should not update when activeCalls is undefined', async () => {
      controller['_isSelfCall'] = jest.fn();
      mockConfig.getSyncToken.mockReturnValue('token');
      const mockData = {} as any;
      mockConfig.getPseudoCallLogInfo.mockReturnValue({
        sessionId1: {},
      });
      controller['_saveDataAndNotify'] = jest.fn();

      await controller.handleRCPresenceEvent(mockData);
      expect(controller['_isSelfCall']).not.toHaveBeenCalled();
      expect(mockConfig.getPseudoCallLogInfo).toHaveBeenCalled();
      expect(controller['_saveDataAndNotify']).not.toHaveBeenCalled();
    });

    it('should parse and save/notify pseudo data, JPT-2504', async () => {
      controller['_isSelfCall'] = jest.fn().mockResolvedValue(false);
      mockConfig.getSyncToken.mockReturnValue('token');
      const mockData = {
        activeCalls: [
          {
            sessionId: 'sessionId1',
          },
          {
            sessionId: 'sessionId2',
            direction: CALL_DIRECTION.OUTBOUND,
            telephonyStatus: TELEPHONY_STATUS.NoCall,
            terminationType: 'final',
            startTime: '12356',
          },
          {
            sessionId: 'sessionId3',
            direction: CALL_DIRECTION.INBOUND,
            telephonyStatus: TELEPHONY_STATUS.NoCall,
            terminationType: 'final',
            startTime: '123567',
            from: 'anonymous',
          },
        ],
      } as any;
      mockConfig.getPseudoCallLogInfo.mockReturnValue({
        sessionId1: {},
      });
      controller['_getCallLogBySessionId'] = jest
        .fn()
        .mockReturnValue(undefined);

      await controller.handleRCPresenceEvent(mockData);
      expect(mockConfig.getPseudoCallLogInfo).toHaveBeenCalled();
      expect(mockConfig.setPseudoCallLogInfo).toHaveBeenCalledWith({
        sessionId1: {},
        sessionId2: {
          id: 'sessionId2Outbound',
          result: 'Unknown',
        },
        sessionId3: {
          id: 'sessionId3Inbound',
          result: 'Unknown',
        },
      });
      expect(
        mockSourceController.bulkUpdate.mock.calls[0][0][0],
      ).toHaveProperty('__isPseudo', true);
      expect(
        mockSourceController.bulkUpdate.mock.calls[0][0][1],
      ).toHaveProperty('__isPseudo', true);
      expect(
        mockSourceController.bulkUpdate.mock.calls[0][0][1],
      ).toHaveProperty('from', undefined);
    });
  });

  describe('_isSelfCall', () => {
    it('should return true when call from my self', async () => {
      const mockNumber = '12345679';
      mockPersonService.getById.mockReturnValue('data');
      mockPersonService.getPhoneNumbers.mockImplementation(
        (person: any, func: any) => {
          func({ id: mockNumber });
        },
      );
      expect(
        await controller['_isSelfCall']({
          direction: CALL_DIRECTION.INBOUND,
          from: mockNumber,
        } as any),
      ).toBeTruthy();
    });

    it('should return true when call to my self', async () => {
      const mockNumber = '12345679';
      mockPersonService.getById.mockReturnValue('data');
      mockPersonService.getPhoneNumbers.mockImplementation(
        (person: any, func: any) => {
          func({ id: mockNumber });
        },
      );
      expect(
        await controller['_isSelfCall']({
          direction: CALL_DIRECTION.OUTBOUND,
          to: mockNumber,
        } as any),
      ).toBeTruthy();
    });

    it('should return false when is call from/to my self', async () => {
      const mockNumber = '12345679';
      mockPersonService.getById.mockReturnValue('data');
      mockPersonService.getPhoneNumbers.mockImplementation(
        (person: any, func: any) => {
          func({ id: '' });
        },
      );
      expect(
        await controller['_isSelfCall']({
          direction: CALL_DIRECTION.INBOUND,
          from: mockNumber,
          to: mockNumber,
        } as any),
      ).toBeFalsy();
    });
  });
});
