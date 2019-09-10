/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-06-24 10:05:38
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { RecentCallLogsHandler } from '../RecentCallLogsHandler';
import { CallLogService } from 'sdk/module/RCItems/callLog';

import notificationCenter, {
  NotificationEntityDeletePayload,
  NotificationEntityUpdatePayload,
  NotificationEntityReplacePayload,
  NotificationEntityReloadPayload,
} from 'sdk/service/notificationCenter';
import { FetchSortableDataListHandler } from '@/store/base/fetch/FetchSortableDataListHandler';
import { EVENT_TYPES } from 'sdk/service';
import { CallLog } from 'sdk/module/RCItems/callLog/entity';
import _ from 'lodash';

jest.mock('sdk/service/notificationCenter');
jest.mock('sdk/module/RCItems/callLog');
jest.mock('sdk/module/serviceLoader');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RecentCallLogsHandler', () => {
  let callLogService: CallLogService;
  let recentCallLogsHandler: RecentCallLogsHandler;
  function prepareData() {
    const recentCalls = new Map([
      ['+18885439787', { creationTime: 5, id: '1' }],
      ['+18885439783', { creationTime: 4, id: '2' }],
      ['+18885439782', { creationTime: 3, id: '3' }],
      ['+18885439781', { creationTime: 2, id: '4' }],
    ]);
    return { recentCalls };
  }
  function setUp() {
    callLogService = new CallLogService();
    recentCallLogsHandler = new RecentCallLogsHandler();
    const serviceMap = new Map([
      [ServiceConfig.CALL_LOG_SERVICE, callLogService],
    ]);
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        return serviceMap.get(config);
      });

    callLogService.fetchRecentCallLogs = jest
      .fn()
      .mockResolvedValue(prepareData().recentCalls);
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  const callLog = {
    direction: 'Outbound',
    duration: 10,
    from: {
      phoneNumber: '+18474970910',
      extensionId: '1028703004',
      name: '1w-Call-log New1',
    },
    id: '1-update',
    result: 'Call connected',
    sessionId: '9304694004',
    to: { phoneNumber: '+18885439783' },
    __timestamp: 10,
  } as any;

  const callLog2 = {
    direction: 'Inbound',
    duration: 10,
    from: {
      phoneNumber: '+18474970910',
      extensionId: '1028703004',
      name: '1w-Call-log New1',
    },
    id: '2-update',
    result: 'Call connected',
    sessionId: '9304694004',
    to: { phoneNumber: '+1888543978300' },
    __timestamp: 11,
  } as any;

  describe('init', () => {
    it('should fetch recent call log from call log service and init private variables', async () => {
      await recentCallLogsHandler.init();
      expect(notificationCenter.on).toHaveBeenCalledWith(
        'ENTITY.CALLLOG',
        recentCallLogsHandler.handleCallLogChanges,
      );
      expect(recentCallLogsHandler['_recentCallIds']).toEqual([
        '1',
        '2',
        '3',
        '4',
      ]);
      expect(recentCallLogsHandler['_recentCalls']).toEqual(
        prepareData().recentCalls,
      );
      expect(recentCallLogsHandler.foc).toBeInstanceOf(
        FetchSortableDataListHandler,
      );
    });
  });

  describe('dispose', () => {
    beforeEach(async () => {
      await recentCallLogsHandler.init();
      recentCallLogsHandler['_idListHandler'].onSourceIdsChanged = jest.fn();
    });

    it('should off notification when call dispose', () => {
      recentCallLogsHandler['_idListHandler'].dispose = jest.fn();
      recentCallLogsHandler.dispose();

      expect(
        recentCallLogsHandler['_idListHandler'].dispose,
      ).toHaveBeenCalled();
      expect(notificationCenter.off).toHaveBeenCalledWith(
        'ENTITY.CALLLOG',
        recentCallLogsHandler.handleCallLogChanges,
      );
    });
  });

  describe('handle data change', () => {
    beforeEach(async () => {
      clearMocks();
      setUp();
      await recentCallLogsHandler.init();
      recentCallLogsHandler['_idListHandler'].onSourceIdsChanged = jest.fn();
    });

    it('should redo init when a call become unknown from known', (done: any) => {
      recentCallLogsHandler['_recentCallIds'] = ['1-update', '2-update'];
      const cpCallLog = { ..._.cloneDeep(callLog), to: { name: 'good' } };
      const payload: NotificationEntityUpdatePayload<CallLog, string> = {
        type: EVENT_TYPES.UPDATE,
        body: {
          ids: ['1-update', '2-update'],
          entities: new Map([['1-update', cpCallLog], ['2-update', callLog2]]),
        },
      };
      recentCallLogsHandler['_initRecentCallInfo'] = jest.fn();
      recentCallLogsHandler.handleCallLogChanges(payload);

      setTimeout(() => {
        expect(recentCallLogsHandler['_initRecentCallInfo']).toHaveBeenCalled();
        expect(
          recentCallLogsHandler['_idListHandler'].onSourceIdsChanged,
        ).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should redo init when a call become deactivated', (done: any) => {
      recentCallLogsHandler['_recentCallIds'] = ['1-update', '2-update'];
      const cpCallLog = { ..._.cloneDeep(callLog), deleted: true };
      const payload: NotificationEntityUpdatePayload<CallLog, string> = {
        type: EVENT_TYPES.UPDATE,
        body: {
          ids: ['1-update', '2-update'],
          entities: new Map([['1-update', cpCallLog], ['2-update', callLog2]]),
        },
      };
      recentCallLogsHandler['_initRecentCallInfo'] = jest.fn();
      recentCallLogsHandler.handleCallLogChanges(payload);

      setTimeout(() => {
        expect(recentCallLogsHandler['_initRecentCallInfo']).toHaveBeenCalled();
        expect(
          recentCallLogsHandler['_idListHandler'].onSourceIdsChanged,
        ).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should replace existing data when receive replace', (done: any) => {
      const payload: NotificationEntityReplacePayload<CallLog, string> = {
        type: EVENT_TYPES.REPLACE,
        body: {
          ids: ['3'],
          isReplaceAll: false,
          entities: new Map([['3', callLog]]),
        },
      };

      recentCallLogsHandler.handleCallLogChanges(payload);
      setTimeout(() => {
        const newIds = ['1-update', '1', '4'];
        expect(
          recentCallLogsHandler['_idListHandler'].onSourceIdsChanged,
        ).toHaveBeenCalledWith(newIds);
        expect(recentCallLogsHandler['_recentCallIds']).toEqual(newIds);
        done();
      }, 10);
    });

    it('should update source ids when receive update', (done: any) => {
      const payload: NotificationEntityUpdatePayload<CallLog, string> = {
        type: EVENT_TYPES.UPDATE,
        body: {
          ids: ['1-update', '2-update'],
          entities: new Map([['1-update', callLog], ['2-update', callLog2]]),
        },
      };
      recentCallLogsHandler.handleCallLogChanges(payload);
      setTimeout(() => {
        const newIds = ['2-update', '1-update', '1', '3', '4'];
        expect(
          recentCallLogsHandler['_idListHandler'].onSourceIdsChanged,
        ).toHaveBeenCalledWith(newIds);
        expect(recentCallLogsHandler['_recentCallIds']).toEqual(newIds);
        done();
      }, 10);
    });

    it('should re-fetch from DB when delete a id in recent call list', async (done: any) => {
      const payload: NotificationEntityDeletePayload<string> = {
        type: EVENT_TYPES.DELETE,
        body: {
          ids: ['1'],
        },
      };

      callLogService.fetchRecentCallLogs = jest
        .fn()
        .mockResolvedValue(
          new Map([
            ['+18885439783', { creationTime: 4, id: '2' }],
            ['+18885439782', { creationTime: 3, id: '3' }],
          ]),
        );

      await recentCallLogsHandler.handleCallLogChanges(payload);
      setTimeout(() => {
        const newIds = ['2', '3'];
        expect(callLogService.fetchRecentCallLogs).toHaveBeenCalled();
        expect(recentCallLogsHandler['_recentCallIds']).toEqual(newIds);
        done();
      }, 10);
    });

    it('should reload when receive reload notification', async (done: any) => {
      callLogService.fetchRecentCallLogs = jest
        .fn()
        .mockResolvedValue(
          new Map([
            ['+18885439783', { creationTime: 4, id: '2' }],
            ['+18885439782', { creationTime: 3, id: '3' }],
          ]),
        );

      const payload: NotificationEntityReloadPayload<string> = {
        type: EVENT_TYPES.RELOAD,
        isReloadAll: true,
        body: { ids: [] },
      };
      recentCallLogsHandler.handleCallLogChanges(payload);
      setTimeout(() => {
        const newIds = ['2', '3'];
        expect(callLogService.fetchRecentCallLogs).toHaveBeenCalled();
        expect(recentCallLogsHandler['_recentCallIds']).toEqual(newIds);
        done();
      }, 10);
    });
  });
});
