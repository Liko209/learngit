/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-18 19:55:08
 * Copyright © RingCentral. All rights reserved.
 */
import { TypeDictionary } from '../../../../utils';
import ItemApi from '../../../../api/glip/item';
import { GroupConfigService } from '../../../../service/groupConfig';
import notificationCenter from '../../../../service/notificationCenter';
import { ItemSyncController } from '../ItemSyncController';
import { Listener } from 'eventemitter2';
import { SERVICE } from '../../../../service/eventKey';
import { ApiResultOk, ApiResultErr } from '../../../../api/ApiResult';
import { BaseResponse } from 'foundation';
import { JServerError, ERROR_CODES_SERVER } from '../../../../error';

jest.mock('../../../../api/glip/item');
jest.mock('../../service/IItemService');
jest.mock('../../../../service/groupConfig');
jest.mock('../../../../service/notificationCenter');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('ItemSyncController', () => {
  const groupConfigService = new GroupConfigService();
  let dataHandlerFunc = jest.fn().mockImplementation(() => {});
  let itemService = {
    getItemDataHandler: jest.fn().mockReturnValue(dataHandlerFunc),
  };
  let itemSyncController = new ItemSyncController(itemService);

  function setUp() {
    dataHandlerFunc = jest.fn().mockImplementation(() => {});
    itemService = {
      getItemDataHandler: jest.fn().mockReturnValue(dataHandlerFunc),
    };

    itemSyncController = new ItemSyncController(itemService);

    GroupConfigService.getInstance = jest
      .fn()
      .mockReturnValue(groupConfigService);

    ItemApi.getItems = jest.fn();
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('requestSyncGroupItems', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should clear syncedGroupIds when socket io is not in connected or connecting status ', () => {
      let tlistener: Listener;
      const syncedGroupIds: Set<number> = new Set();
      syncedGroupIds.add(1);

      notificationCenter.on = jest
        .fn()
        .mockImplementation((event: string, listener: Listener) => {
          expect(event).toEqual(SERVICE.SOCKET_STATE_CHANGE);
          tlistener = listener;
        });

      itemSyncController = new ItemSyncController(itemService);

      Object.assign(itemSyncController, { _syncedGroupIds: syncedGroupIds });
      tlistener('connecting');
      expect(syncedGroupIds.has(1)).toBeTruthy();

      tlistener('connected');
      expect(syncedGroupIds.has(1)).toBeTruthy();

      tlistener('idle');
      expect(syncedGroupIds.has(1)).toBeFalsy();
    });

    it('should jest return when the group has requested before', async () => {
      const syncedGroupIds: Set<number> = new Set();
      syncedGroupIds.add(1);
      Object.assign(itemSyncController, { _syncedGroupIds: syncedGroupIds });
      const spy = jest.spyOn(itemSyncController, '_requestSyncGroupItems');

      itemSyncController.requestSyncGroupItems(1);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should request to sync items', async (done: any) => {
      const groupConfig = {
        id: 10,
        last_index_of_files: 1,
        last_index_of_tasks: 2,
        last_index_of_events: 3,
        last_index_of_notes: 4,
        last_index_of_links: 5,
      };
      const response = new ApiResultOk({ id: 1, name: 'jupiter' }, {
        status: 200,
        headers: {},
      } as BaseResponse);
      ItemApi.getItems = jest.fn().mockResolvedValue(response);
      groupConfigService.getById = jest.fn().mockReturnValue(groupConfig);
      groupConfigService.updateGroupConfigPartialData = jest.fn();

      await itemSyncController.requestSyncGroupItems(groupConfig.id);
      setTimeout(() => {
        expect(groupConfigService.getById).toBeCalledTimes(1);
        expect(ItemApi.getItems).toBeCalledTimes(5);
        expect(ItemApi.getItems).toHaveBeenCalledWith(
          TypeDictionary.TYPE_ID_FILE,
          10,
          1,
        );
        expect(ItemApi.getItems).toHaveBeenCalledWith(
          TypeDictionary.TYPE_ID_TASK,
          10,
          2,
        );
        expect(ItemApi.getItems).toHaveBeenCalledWith(
          TypeDictionary.TYPE_ID_EVENT,
          10,
          3,
        );
        expect(ItemApi.getItems).toHaveBeenCalledWith(
          TypeDictionary.TYPE_ID_PAGE,
          10,
          4,
        );
        expect(ItemApi.getItems).toHaveBeenCalledWith(
          TypeDictionary.TYPE_ID_LINK,
          10,
          5,
        );
        expect(groupConfigService.updateGroupConfigPartialData).toBeCalledTimes(
          5,
        );

        expect(groupConfigService.updateGroupConfigPartialData).toBeCalledWith({
          id: 10,
          last_index_of_links: expect.any(Number),
        });
        expect(groupConfigService.updateGroupConfigPartialData).toBeCalledWith({
          id: 10,
          last_index_of_tasks: expect.any(Number),
        });
        expect(groupConfigService.updateGroupConfigPartialData).toBeCalledWith({
          id: 10,
          last_index_of_notes: expect.any(Number),
        });
        expect(groupConfigService.updateGroupConfigPartialData).toBeCalledWith({
          id: 10,
          last_index_of_events: expect.any(Number),
        });
        expect(groupConfigService.updateGroupConfigPartialData).toBeCalledWith({
          id: 10,
          last_index_of_files: expect.any(Number),
        });
        expect(dataHandlerFunc).toBeCalledTimes(5);
        done();
      });
    });

    it('should throw error when request sync item failed', async () => {
      const groupConfig = {
        id: 10,
        last_index_of_files: 1,
        last_index_of_tasks: 2,
        last_index_of_events: 3,
        last_index_of_notes: 4,
        last_index_of_links: 5,
      };
      const response = new ApiResultErr(
        new JServerError(ERROR_CODES_SERVER.GENERAL, 'error'),
        {
          status: 400,
          headers: {},
        } as BaseResponse,
      );
      ItemApi.getItems = jest.fn().mockResolvedValue(response);
      groupConfigService.getById = jest.fn().mockReturnValue(groupConfig);
      groupConfigService.updateGroupConfigPartialData = jest.fn();
      expect(
        itemSyncController.requestSyncGroupItems(groupConfig.id),
      ).resolves.toThrow();
      expect(
        (groupConfigService.updateGroupConfigPartialData = jest.fn()),
      ).not.toHaveBeenCalled();
    });
  });
});
