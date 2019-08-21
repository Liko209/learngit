/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-29 10:08:01
 * Copyright © RingCentral. All rights reserved.
 */

import { CallLogActionController } from '../CallLogActionController';
import { EntitySourceController } from 'sdk/framework/controller/impl/EntitySourceController';
import { CallLog } from '../../entity';
import { RCItemApi } from 'sdk/api/ringcentral/RCItemApi';
import { notificationCenter, ENTITY_LIST } from 'sdk/service';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { SETTING_KEYS } from 'sdk/module/profile';
import { daoManager } from 'sdk/dao';

jest.mock('sdk/api/ringcentral/RCItemApi');
jest.mock('sdk/framework/controller/impl/EntitySourceController');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('CallLogActionController', () => {
  const entityKey = 'key_key';
  let callLogActionController: CallLogActionController;
  let entitySourceController: EntitySourceController<CallLog, string>;
  function setUp() {
    entitySourceController = new EntitySourceController(
      null as any,
      null as any,
    );
    entitySourceController.getEntityNotificationKey = jest
      .fn()
      .mockReturnValue(entityKey);
    callLogActionController = new CallLogActionController(
      entitySourceController,
    );
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('construct', () => {
    it('should be type of CallLogActionController', () => {
      const res = new CallLogActionController(entitySourceController);
      expect(res).toBeInstanceOf(CallLogActionController);
    });
  });

  describe('deleteCallLogs', () => {
    it('should call api and source controller', async () => {
      const ids = ['1', '2', '3'];
      notificationCenter.emitEntityUpdate = jest.fn();
      entitySourceController.getEntitiesLocally = jest
        .fn()
        .mockResolvedValue([{ id: '1' }, { id: '2' }, { id: '3' }]);

      await callLogActionController.deleteCallLogs(ids);
      expect(RCItemApi.deleteCallLog).toHaveBeenCalledWith(ids);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledWith(entityKey, [
        { deleted: true, id: '1' },
        { deleted: true, id: '2' },
        { deleted: true, id: '3' },
      ]);
      expect(entitySourceController.bulkDelete).toHaveBeenCalledWith(ids);
    });
  });

  describe('clearUnreadMissedCall', () => {
    it('should call updateSettingOptions', async () => {
      const mockUpdateSettingOptions = jest.fn();
      ServiceLoader.getInstance = jest.fn().mockReturnValue({
        updateSettingOptions: mockUpdateSettingOptions,
      });
      daoManager.getDao = jest.fn().mockReturnValue({
        queryNewestTimestamp: jest.fn().mockReturnValue(13),
      });
      await callLogActionController.clearUnreadMissedCall();
      expect(mockUpdateSettingOptions).toHaveBeenCalledWith([
        {
          key: SETTING_KEYS.LAST_READ_MISSED,
          value: 13,
        },
      ]);
    });

    it('should do nothing when can not get newest time', async () => {
      const mockUpdateSettingOptions = jest.fn();
      ServiceLoader.getInstance = jest.fn().mockReturnValue({
        updateSettingOptions: mockUpdateSettingOptions,
      });
      daoManager.getDao = jest.fn().mockReturnValue({
        queryNewestTimestamp: jest.fn().mockReturnValue(null),
      });
      await callLogActionController.clearUnreadMissedCall();
      expect(mockUpdateSettingOptions).not.toHaveBeenCalled();
    });
  });
});
