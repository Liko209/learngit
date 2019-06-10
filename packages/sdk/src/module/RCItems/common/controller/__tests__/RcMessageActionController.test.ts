/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-27 19:19:02
 * Copyright © RingCentral. All rights reserved.
 */

import { RCItemApi } from 'sdk/api/ringcentral/RCItemApi';
import { EntitySourceController } from 'sdk/framework/controller/impl/EntitySourceController';
import { PartialModifyController } from 'sdk/framework/controller/impl/PartialModifyController';
import { RcMessageActionController } from '../RcMessageActionController';
import { notificationCenter } from 'sdk/service';
import { AccountService } from 'sdk/module/account';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { READ_STATUS } from 'sdk/module/RCItems/constants';

jest.mock('sdk/module/account');
jest.mock('sdk/framework/controller/impl/EntitySourceController');
jest.mock('sdk/api/ringcentral/RCItemApi');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RcMessageActionController', () => {
  const entityKey = 'key_key';
  let entitySourceController: EntitySourceController<any>;
  let partialModifyController: PartialModifyController<any>;
  let rcMessageActionController: RcMessageActionController<any>;
  let accountService: AccountService;
  function setUp() {
    accountService = new AccountService(null as any);
    entitySourceController = new EntitySourceController(
      null as any,
      null as any,
    );
    partialModifyController = new PartialModifyController(
      entitySourceController,
    );
    entitySourceController.getEntityNotificationKey = jest
      .fn()
      .mockReturnValue(entityKey);
    rcMessageActionController = new RcMessageActionController(
      'logTag',
      entitySourceController,
      partialModifyController,
    );

    ServiceLoader.getInstance = jest.fn().mockReturnValue(accountService);
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('deleteRcMessages', () => {
    const ids = [1, 2, 3];
    beforeEach(() => {
      clearMocks();
      setUp();
      notificationCenter.emitEntityUpdate = jest.fn();

      entitySourceController.batchGet = jest
        .fn()
        .mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it('deleteRcMessages, should set availability to delete when is not purge', async () => {
      entitySourceController.batchGet = jest
        .fn()
        .mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
      await rcMessageActionController.deleteRcMessages(ids, false);
      expect(RCItemApi.deleteMessage).toBeCalledWith(ids);
      expect(notificationCenter.emitEntityUpdate).toBeCalledWith(entityKey, [
        { availability: 'Deleted', id: 1 },
        { availability: 'Deleted', id: 2 },
        { availability: 'Deleted', id: 3 },
      ]);
      expect(entitySourceController.bulkDelete).toBeCalledWith(ids);
    });

    it('deleteRcMessages, should set availability to purge when is purge', async () => {
      await rcMessageActionController.deleteRcMessages(ids, true);
      expect(RCItemApi.deleteMessage).toBeCalledWith(ids);
      expect(notificationCenter.emitEntityUpdate).toBeCalledWith(entityKey, [
        { availability: 'Purged', id: 1 },
        { availability: 'Purged', id: 2 },
        { availability: 'Purged', id: 3 },
      ]);
    });
  });

  describe('updateReadStatus', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should do partial update and send request', async () => {
      const entityId = 123;
      const testEntity = {
        id: entityId,
        readStatus: 'Read',
      };
      notificationCenter.emitEntityUpdate = jest.fn();
      partialModifyController.updatePartially = jest
        .fn()
        .mockImplementation(
          async (
            entityId: number,
            preHandlePartialEntity: (
              partialEntity: Partial<any>,
              originalEntity: any,
            ) => Partial<any>,
            doUpdateEntity: (updatedEntity: any) => Promise<any>,
          ) => {
            expect(entityId).toEqual(entityId);
            expect(preHandlePartialEntity(testEntity as any, null)).toEqual({
              id: entityId,
              readStatus: 'Unread',
            });
            await doUpdateEntity({
              id: entityId,
              readStatus: READ_STATUS.UNREAD,
            });
            expect(RCItemApi.updateMessageReadStatus).toBeCalledWith(
              entityId,
              READ_STATUS.UNREAD,
            );
            expect(entitySourceController.update).toBeCalled();
            expect(notificationCenter.emitEntityUpdate).toBeCalled();
          },
        );

      await rcMessageActionController.updateReadStatus(
        entityId,
        READ_STATUS.UNREAD,
      );
      expect.assertions(5);
    });
  });

  describe('buildDownloadUrl', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return url with access token', async () => {
      accountService.getRCToken = jest
        .fn()
        .mockResolvedValue({ access_token: 'token' });
      const res = await rcMessageActionController.buildDownloadUrl('123');
      expect(res).toEqual('123?access_token=token');
    });

    it('should return empty url when no access token', async () => {
      accountService.getRCToken = jest.fn().mockResolvedValue(undefined);
      const res = await rcMessageActionController.buildDownloadUrl('123');
      expect(res).toEqual('');
    });

    it('should return empty when error happen', async () => {
      accountService.getRCToken = jest.fn().mockRejectedValue(new Error());
      const res = await rcMessageActionController.buildDownloadUrl('123');
      expect(res).toEqual('');
    });
  });
});
