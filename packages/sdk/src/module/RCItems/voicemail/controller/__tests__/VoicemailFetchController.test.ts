/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-28 16:47:17
 * Copyright © RingCentral. All rights reserved.
 */

import { VoicemailFetchController } from '../VoicemailFetchController';
import { EntitySourceController } from 'sdk/framework/controller/impl/EntitySourceController';
import { Voicemail } from '../../entity';
import { RCItemUserConfig } from '../../../config';
import { RCItemApi } from 'sdk/api';
import { notificationCenter } from 'sdk/service';
import {
  RC_MESSAGE_TYPE,
  SYNC_DIRECTION,
  MESSAGE_AVAILABILITY,
} from 'sdk/module/RCItems/constants';
import { daoManager, QUERY_DIRECTION } from 'sdk/dao';
import { VoicemailDao } from '../../dao/VoicemailDao';
import { JError, ERROR_CODES_RC, ERROR_MSG_RC } from 'sdk/error';
import { RCMessageBadgeController } from 'sdk/module/RCItems/common/controller/RCMessageBadgeController';
import { SYNC_TYPE } from 'sdk/module/RCItems/sync';
import { RCItemFetchController } from 'sdk/module/RCItems/common/controller/RCItemFetchController';
import { VOICEMAIL_PERFORMANCE_KEYS } from '../../config/performanceKeys';

jest.mock('sdk/dao');
jest.mock('../../dao/VoicemailDao');
jest.mock('../../../config');
jest.mock('sdk/api/ringcentral/RCItemApi');
jest.mock('sdk/framework/controller/impl/EntitySourceController');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('VoicemailFetchController', () => {
  let vmDao: VoicemailDao;
  let rcItemUserConfig: RCItemUserConfig;
  let voicemailFetchController: VoicemailFetchController;
  let entitySourceController: EntitySourceController<Voicemail>;
  let mockBadgeController: RCMessageBadgeController<Voicemail>;
  function setUp() {
    vmDao = new VoicemailDao(null as any);
    rcItemUserConfig = new RCItemUserConfig('name');
    entitySourceController = new EntitySourceController(
      null as any,
      null as any,
    );
    mockBadgeController = {
      handleVoicemails: jest.fn(),
    } as any;
    entitySourceController.getEntityNotificationKey = jest
      .fn()
      .mockReturnValue('test');
    voicemailFetchController = new VoicemailFetchController(
      rcItemUserConfig,
      entitySourceController,
      mockBadgeController,
    );
    daoManager.getDao = jest.fn().mockResolvedValue(vmDao);
  }
  beforeEach(() => {
    setUp();
    clearMocks();
  });

  describe('buildFilterFunc', () => {
    it('should filter valid data ', async () => {
      const mockData = [
        { id: '1', availability: MESSAGE_AVAILABILITY.ALIVE },
        { id: '2', availability: MESSAGE_AVAILABILITY.DELETED },
        { id: '3', availability: MESSAGE_AVAILABILITY.ALIVE },
      ];
      RCItemFetchController.prototype.buildFilterFunc = jest
        .fn()
        .mockReturnValue((data: any) => {
          return data.id !== '3';
        });
      const filter = (await voicemailFetchController.buildFilterFunc(
        {},
      )) as any;
      expect(mockData.filter(filter)).toEqual([
        { id: '1', availability: MESSAGE_AVAILABILITY.ALIVE },
      ]);
    });
  });

  describe('sendSyncRequest', () => {
    it('should call RCItemApi and not pass message type when do ISync', async () => {
      await voicemailFetchController['sendSyncRequest'](
        'ISync' as any,
        'token',
        100,
      );
      expect(RCItemApi.syncMessage).toBeCalledWith({
        messageType: undefined,
        recordCount: 100,
        syncToken: 'token',
        syncType: 'ISync',
      });
    });

    it('should call RCItemApi and pass message type when do FSync', async () => {
      await voicemailFetchController['sendSyncRequest'](
        'FSync' as any,
        'token',
        100,
      );
      expect(RCItemApi.syncMessage).toBeCalledWith({
        messageType: 'VoiceMail',
        recordCount: 100,
        syncToken: 'token',
        syncType: 'FSync',
      });
    });
  });

  describe('requestClearAllAndRemoveLocalData', () => {
    it('should send request and clear all local data and send notification when do clear all', async () => {
      notificationCenter.emitEntityReload = jest.fn();
      await voicemailFetchController.clearAll();
      expect(entitySourceController.clear).toBeCalled();
      expect(RCItemApi.deleteAllMessages).toBeCalledWith({
        type: RC_MESSAGE_TYPE.VOICEMAIL,
      });
      expect(notificationCenter.emitEntityReload).toBeCalledWith(
        'test',
        [],
        true,
      );
    });
  });

  describe('isTokenInvalidError', () => {
    it('should return true when is token error ', () => {
      const res = voicemailFetchController['isTokenInvalidError'](
        new JError('123', ERROR_CODES_RC.MSG_333),
      );
      expect(res).toBeTruthy();
    });

    it('should return true when is token error ', () => {
      const res = voicemailFetchController['isTokenInvalidError'](
        new JError('123', '', ERROR_MSG_RC.SYNC_TOKEN_INVALID_ERROR_MSG),
      );
      expect(res).toBeTruthy();
    });

    it('should return false when not is token error ', () => {
      const res = voicemailFetchController['isTokenInvalidError'](
        new JError('123', ERROR_CODES_RC.CLG_102),
      );
      expect(res).toBeFalsy();
    });
  });

  describe('handleDataAndSave', () => {
    beforeEach(() => {
      setUp();
      clearMocks();
    });

    it('should update alive vm and delete invalid vm', async () => {
      const data = {
        records: [
          {
            id: 1,
            availability: 'Alive',
            creationTime: '2018-01-19T07:51:50.000Z',
          },
          {
            id: 2,
            availability: 'Deleted',
            creationTime: '2018-01-19T07:51:50.000Z',
          },
          {
            id: 3,
            availability: 'Purged',
            creationTime: '2018-01-19T07:51:50.000Z',
          },
        ],
        syncInfo: {
          syncType: SYNC_TYPE.FSYNC,
        },
      };

      await voicemailFetchController['handleDataAndSave'](data as any);
      expect(entitySourceController.bulkUpdate).toBeCalledWith([
        {
          id: 1,
          availability: 'Alive',
          creationTime: '2018-01-19T07:51:50.000Z',
          __timestamp: 1516348310000,
        },
      ]);
      expect(entitySourceController.bulkDelete).toBeCalledWith([2, 3]);
    });
  });

  describe('getFilterInfo', () => {
    it('should get caller from call log', () => {
      expect(
        voicemailFetchController['getFilterInfo']({
          from: 'from',
        } as any),
      ).toEqual('from');
      expect(voicemailFetchController['getFilterInfo']({} as any)).toEqual({});
    });
  });

  describe('fetchDataFromDB', () => {
    it('should call dao', async () => {
      const mockFunc = jest.fn().mockReturnValue('data');
      daoManager.getDao = jest
        .fn()
        .mockReturnValue({ queryVoicemails: mockFunc });
      expect(await voicemailFetchController['fetchDataFromDB']({})).toEqual(
        'data',
      );
      expect(mockFunc).toBeCalled();
    });
  });

  describe('onDBFetchFinished', () => {
    it('should call performanceTracer', () => {
      const tracer = { trace: jest.fn() };
      voicemailFetchController['onDBFetchFinished'](
        [{}, {}] as any,
        tracer as any,
      );
      expect(tracer.trace).toBeCalledWith({
        key: VOICEMAIL_PERFORMANCE_KEYS.FETCH_VOICEMAILS_FROM_DB,
        count: 2,
      });
    });
  });

  describe('onFetchFinished', () => {
    it('should call performanceTracer', () => {
      const tracer = { end: jest.fn() };
      voicemailFetchController['_badgeController'].handleVoicemails = jest.fn();
      voicemailFetchController['onFetchFinished'](
        [{}, {}] as any,
        tracer as any,
      );
      expect(tracer.end).toBeCalledWith({
        key: VOICEMAIL_PERFORMANCE_KEYS.FETCH_VOICEMAILS,
        count: 2,
      });
      expect(
        voicemailFetchController['_badgeController'].handleVoicemails,
      ).toBeCalled();
    });
  });
});
