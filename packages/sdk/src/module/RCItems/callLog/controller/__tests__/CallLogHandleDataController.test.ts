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
import { CallLog } from '../../entity';

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

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    controller = new CallLogHandleDataController(
      mockConfig,
      mockSourceController,
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
      expect(mockConfig.getPseudoCallLogInfo).not.toBeCalled();
    });

    it('should do nothing when can not get sessionId', async () => {
      mockConfig.getSyncToken.mockReturnValue('token');
      const mockData = {
        timestamp: 'time',
        extensionId: 123,
      } as any;

      await controller.handleMissedCallEvent(mockData);
      expect(mockConfig.getPseudoCallLogInfo).not.toBeCalled();
    });

    it('should do nothing when can not get timestamp', async () => {
      mockConfig.getSyncToken.mockReturnValue('token');
      const mockData = {
        sessionId: 'id',
        extensionId: 123,
      } as any;

      await controller.handleMissedCallEvent(mockData);
      expect(mockConfig.getPseudoCallLogInfo).not.toBeCalled();
    });

    it('should do nothing when can not get extensionId', async () => {
      mockConfig.getSyncToken.mockReturnValue('token');
      const mockData = {
        timestamp: 'time',
        sessionId: 'id',
        extensionId: -1,
      } as any;

      await controller.handleMissedCallEvent(mockData);
      expect(mockConfig.getPseudoCallLogInfo).not.toBeCalled();
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
      expect(controller['_getCallLogBySessionId']).not.toBeCalled();
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
      expect(controller['_getCallLogFromMissedCall']).not.toBeCalled();
    });

    it('should parse and save/notify pseudo data', async () => {
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
      expect(mockConfig.setPseudoCallLogInfo).toBeCalledWith({
        id: {
          id: 'id' + CALL_DIRECTION.INBOUND,
          result: CALL_RESULT.MISSED,
        },
      });
      expect(mockSourceController.bulkUpdate).toBeCalled();
    });
  });

  describe('handleRCPresenceEvent', () => {
    it('should do nothing when can not get sync token', async () => {
      mockConfig.getSyncToken.mockReturnValue(undefined);
      const mockData = {
        activeCalls: [],
      } as any;

      await controller.handleRCPresenceEvent(mockData);
      expect(mockConfig.getPseudoCallLogInfo).not.toBeCalled();
    });

    it('should parse and save/notify pseudo data', async () => {
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
      mockSourceController.bulkUpdate = jest
        .fn()
        .mockImplementation((data: CallLog[]) => {
          expect(data[1].from).toBeUndefined();
        });

      await controller.handleRCPresenceEvent(mockData);
      expect(mockConfig.getPseudoCallLogInfo).toBeCalled();
      expect(mockConfig.setPseudoCallLogInfo).toBeCalledWith({
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
    });
  });
});
