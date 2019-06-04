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
import {
  notificationCenter,
  ENTITY_LIST,
  ENTITY,
  RELOAD_TARGET,
} from 'sdk/service';
import { RC_MESSAGE_TYPE, SYNC_DIRECTION } from 'sdk/module/RCItems/constants';
import { daoManager, QUERY_DIRECTION } from 'sdk/dao';
import { VoicemailDao } from '../../dao/VoicemailDao';
import { JError, ERROR_CODES_RC, ERROR_MSG_RC } from 'sdk/error';
import { RCMessageBadgeController } from 'sdk/module/RCItems/common/controller/RCMessageBadgeController';

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
        RELOAD_TARGET.FOC,
        [],
        true,
      );
    });
  });

  describe('fetchVoicemails', () => {
    const localData = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const remoteData = [{ id: 4 }, { id: 5 }, { id: 6 }];

    beforeEach(() => {
      rcItemUserConfig.getHasMore = jest.fn().mockResolvedValue(false);
      daoManager.getDao = jest.fn().mockReturnValue(vmDao);
      vmDao.queryVoicemails = jest.fn().mockResolvedValue(localData);
      voicemailFetchController.doSync = jest.fn().mockResolvedValue(remoteData);
    });

    it('should get from db and when db has data and do not get from server', async () => {
      const result = await voicemailFetchController.fetchVoicemails(
        100,
        QUERY_DIRECTION.NEWER,
        1,
      );
      expect(voicemailFetchController.doSync).not.toBeCalled();
      expect(result).toEqual({
        hasMore: true,
        data: [...localData],
      });
    });

    it('should only get from the server and when db has no data', async () => {
      vmDao.queryVoicemails = jest.fn().mockResolvedValue([]);
      const result = await voicemailFetchController.fetchVoicemails(
        100,
        QUERY_DIRECTION.NEWER,
        1,
      );
      expect(voicemailFetchController.doSync).toBeCalled();
      expect(result).toEqual({
        hasMore: false,
        data: [...remoteData],
      });
      expect(mockBadgeController.handleVoicemails).toBeCalled();
    });
  });

  describe('isTokenInvalidError', () => {
    it('should return true when is token error ', () => {
      const res = voicemailFetchController['isTokenInvalidError'](
        new JError(
          '123',
          ERROR_CODES_RC.MSG_333,
          ERROR_MSG_RC.SYNC_TOKEN_INVALID_ERROR_MSG,
        ),
      );
      expect(res).toBeTruthy();
    });

    it('should return false when not is token error ', () => {
      const res = voicemailFetchController['isTokenInvalidError'](
        new JError(
          '123',
          ERROR_CODES_RC.CLG_102,
          ERROR_MSG_RC.SYNC_TOKEN_INVALID_ERROR_MSG,
        ),
      );
      expect(res).toBeFalsy();
    });
  });
});
