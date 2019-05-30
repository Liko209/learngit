/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-18 19:55:08
 * Copyright © RingCentral. All rights reserved.
 */
import ItemApi from '../../../../api/glip/item';
import { GroupConfigService } from '../../../groupConfig';
import notificationCenter from '../../../../service/notificationCenter';
import { ItemSyncController } from '../ItemSyncController';
import { Listener } from 'eventemitter2';
import { JServerError, ERROR_CODES_SERVER } from '../../../../error';
import { ServiceLoader } from '../../../serviceLoader';
import { TypeDictionary } from '../../../../utils/glip-type-dictionary';

jest.mock('../../../../api/glip/item');
jest.mock('../../service/IItemService');
jest.mock('../../../groupConfig');
jest.mock('../../../../service/notificationCenter');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('ItemSyncController', () => {
  let groupConfigService: GroupConfigService;
  let dataHandlerFunc = jest.fn().mockImplementation(() => {});
  let itemService = {
    getItemDataHandler: jest.fn().mockReturnValue(dataHandlerFunc),
  };
  let itemSyncController = new ItemSyncController(itemService);

  function setUp() {
    dataHandlerFunc = jest.fn().mockImplementation(() => {});
    groupConfigService = new GroupConfigService();
    ItemApi.getItems.mockClear();

    itemService = {
      getItemDataHandler: jest.fn().mockReturnValue(dataHandlerFunc),
    };

    itemSyncController = new ItemSyncController(itemService);

    ServiceLoader.getInstance = jest.fn().mockReturnValue(groupConfigService);

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
          // expect(event).toEqual(SERVICE.SOCKET_STATE_CHANGE);
          tlistener = listener;
        });

      itemSyncController = new ItemSyncController(itemService);

      const itemSequenceProcessor = {
        cancelAll: jest.fn(),
      };

      Object.assign(itemSyncController, {
        _itemSequenceProcessor: itemSequenceProcessor,
      });
      Object.assign(itemSyncController, { _syncedGroupItems: syncedGroupIds });
      tlistener('connecting');
      expect(syncedGroupIds.has(1)).toBeTruthy();

      tlistener('connected');
      expect(syncedGroupIds.has(1)).toBeTruthy();

      tlistener('idle');
      expect(syncedGroupIds.has(1)).toBeFalsy();
      expect(itemSequenceProcessor.cancelAll).toBeCalledTimes(1);
    });

    it('should jest return when the group has requested before', async () => {
      const syncedGroupIds: Set<string> = new Set();
      const groupConfig = {
        id: 1,
        last_index_of_files: 1,
        last_index_of_tasks: 2,
        last_index_of_events: 3,
        last_index_of_notes: 4,
        last_index_of_links: 5,
      };
      const response = { id: 1, name: 'jupiter' };
      ItemApi.getItems = jest.fn().mockResolvedValue(response);
      groupConfigService.getById = jest.fn().mockReturnValue(groupConfig);

      syncedGroupIds.add(`1.${TypeDictionary.TYPE_ID_TASK}`);
      syncedGroupIds.add(`1.${TypeDictionary.TYPE_ID_FILE}`);
      syncedGroupIds.add(`1.${TypeDictionary.TYPE_ID_PAGE}`);
      syncedGroupIds.add(`1.${TypeDictionary.TYPE_ID_EVENT}`);
      syncedGroupIds.add(`1.${TypeDictionary.TYPE_ID_LINK}`);

      Object.assign(itemSyncController, { _syncedGroupItems: syncedGroupIds });

      const spyOnGetItemSyncProcessor = jest.spyOn(
        itemSyncController,
        '_getItemSyncProcessor',
      );

      await itemSyncController.requestSyncGroupItems(1);
      expect(spyOnGetItemSyncProcessor).not.toHaveBeenCalled();
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
      const response = { id: 1, name: 'jupiter' };
      ItemApi.getItems = jest.fn().mockResolvedValue(response);
      groupConfigService.getById = jest.fn().mockReturnValue(groupConfig);
      groupConfigService.saveAndDoNotify = jest.fn();
      const spyOnGetItemSyncProcessor = jest.spyOn(
        itemSyncController,
        '_getItemSyncProcessor',
      );

      await itemSyncController.requestSyncGroupItems(groupConfig.id);
      setTimeout(() => {
        expect(groupConfigService.getById).toBeCalledTimes(1);
        expect(spyOnGetItemSyncProcessor).toHaveBeenCalledTimes(5);
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
        expect(groupConfigService.saveAndDoNotify).toBeCalledTimes(5);

        expect(groupConfigService.saveAndDoNotify).toBeCalledWith({
          id: 10,
          last_index_of_links: expect.any(Number),
        });
        expect(groupConfigService.saveAndDoNotify).toBeCalledWith({
          id: 10,
          last_index_of_tasks: expect.any(Number),
        });
        expect(groupConfigService.saveAndDoNotify).toBeCalledWith({
          id: 10,
          last_index_of_notes: expect.any(Number),
        });
        expect(groupConfigService.saveAndDoNotify).toBeCalledWith({
          id: 10,
          last_index_of_events: expect.any(Number),
        });
        expect(groupConfigService.saveAndDoNotify).toBeCalledWith({
          id: 10,
          last_index_of_files: expect.any(Number),
        });
        expect(dataHandlerFunc).toBeCalledTimes(5);
        done();
      });
    });

    it('should not throw error when request sync item failed', async () => {
      const error = new JServerError(ERROR_CODES_SERVER.GENERAL, 'error');
      const groupConfig = {
        id: 10,
        last_index_of_files: 1,
        last_index_of_tasks: 2,
        last_index_of_events: 3,
        last_index_of_notes: 4,
        last_index_of_links: 5,
      };
      ItemApi.getItems = jest.fn().mockRejectedValue(error);
      groupConfigService.getById = jest.fn().mockReturnValue(groupConfig);
      groupConfigService.saveAndDoNotify = jest.fn();

      expect(
        itemSyncController.requestSyncGroupItems(groupConfig.id),
      ).resolves.not.toThrow();

      expect(
        (groupConfigService.saveAndDoNotify = jest.fn()),
      ).not.toHaveBeenCalled();
    });
  });
});
