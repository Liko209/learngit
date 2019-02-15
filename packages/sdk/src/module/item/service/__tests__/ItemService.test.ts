/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-04 14:08:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ItemService } from '../ItemService';
import { ItemServiceController } from '../../controller/ItemServiceController';
import { FileItemService } from '../../module/file';
import { daoManager, ItemDao } from '../../../../dao';
import { ItemFile, Item } from '../../entity';
import { postFactory, rawItemFactory } from '../../../../__tests__/factories';
import { ItemActionController } from '../../controller/ItemActionController';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { SubscribeController } from '../../../base/controller/SubscribeController';
import { Api } from '../../../../api';
import ItemAPI from '../../../../api/glip/item';
import { ApiResultOk } from '../../../../api/ApiResult';
import { transform, baseHandleData } from '../../../../service/utils';
import { TypeDictionary } from '../../../../utils';
import { ItemSyncController } from '../../controller/ItemSyncController';

jest.mock('../../../../service/utils', () => ({
  baseHandleData: jest.fn(),
  transform: jest.fn(),
}));

jest.mock('../../controller/ItemSyncController');
jest.mock('../../../../service/utils');
jest.mock('../../controller/ItemActionController');
jest.mock('../../../../dao');
jest.mock('../../../../api');
jest.mock('../../module/file');
jest.mock('../../controller/ItemServiceController');
jest.mock('../../../base/controller/SubscribeController');

describe('ItemService', () => {
  let itemService: ItemService;
  let itemServiceController: ItemServiceController;
  let fileItemService: FileItemService;
  let itemActionController: ItemActionController;
  const itemSyncController = new ItemSyncController(null);

  function setup() {
    itemService = new ItemService();
    itemServiceController = new ItemServiceController(null, null);
    fileItemService = new FileItemService(itemService);
    itemActionController = new ItemActionController(
      undefined as IPartialModifyController<Item>,
    );

    Object.assign(itemService, {
      _itemServiceController: itemServiceController,
    });

    Object.defineProperties(itemServiceController, {
      itemActionController: {
        get: jest.fn(() => itemActionController),
        configurable: true,
      },
      itemSyncController: {
        get: jest.fn(() => itemSyncController),
        configurable: true,
      },
    });
  }

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('itemSyncController', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });
    it('requestSyncGroupItems', async () => {
      const groupId = 11;
      itemService.requestSyncGroupItems(groupId);
      expect(itemSyncController.requestSyncGroupItems).toBeCalledWith(groupId);
    });
  });

  describe('fileItemService', () => {
    const groupId = 10;
    const file = {
      name: 'file',
      size: 100,
      type: 'js',
    } as File;

    const itemFile = { id: 11 } as ItemFile;
    beforeEach(() => {
      clearMocks();
      setup();

      Object.assign(itemService, {
        _itemServiceController: itemServiceController,
      });

      itemServiceController.getSubItemService = jest
        .fn()
        .mockImplementation(() => {
          return fileItemService;
        });
    });

    describe('getThumbsUrlWithSize', () => {
      it('should call file item service with correct parameter', async () => {
        expect.assertions(2);
        fileItemService.getThumbsUrlWithSize = jest.fn().mockResolvedValue('a');
        const res = await itemService.getThumbsUrlWithSize(1, 2, 3);
        expect(fileItemService.getThumbsUrlWithSize).toBeCalledWith(1, 2, 3);
        expect(res).toBe('a');
      });
    });

    describe('sendItemFile()', () => {
      it('should call file item service with correct parameter', async () => {
        expect.assertions(1);
        fileItemService.sendItemData = jest.fn();
        await itemService.sendItemFile(groupId, file, false);
        expect(fileItemService.sendItemFile).toBeCalledWith(
          groupId,
          file,
          false,
        );
      });
    });

    describe('deleteFileItemCache()', () => {
      it('should call file item service with correct parameter', () => {
        const itemId = -1;
        fileItemService.deleteFileCache = jest.fn();
        itemService.deleteFileItemCache(itemId);
        expect(fileItemService.deleteFileCache).toBeCalledWith(itemId);
      });
    });

    describe('getItemVersion()', () => {
      it('should call file item service with correct parameter', async () => {
        fileItemService.getFileItemVersion = jest.fn();
        await itemService.getItemVersion(itemFile);
        expect(fileItemService.getFileItemVersion).toBeCalledWith(itemFile);
      });
    });

    describe('cancelUpload()', () => {
      it('should call file item service with correct parameter', async () => {
        fileItemService.cancelUpload = jest.fn();
        await itemService.cancelUpload(itemFile.id);
        expect(fileItemService.cancelUpload).toBeCalledWith(itemFile.id);
      });
    });

    describe('getUploadItems()', () => {
      it('should call file item service with correct parameter', () => {
        fileItemService.getUploadItems = jest.fn();
        itemService.getUploadItems(groupId);
        expect(fileItemService.getUploadItems).toBeCalledWith(groupId);
      });
    });

    describe('canResendFailedItems()', () => {
      it('should call file item service with correct parameter', async () => {
        expect.assertions(1);
        const ids = [-2078572554, -801456138, -1];
        fileItemService.hasValidItemFile = jest
          .fn()
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);
        await itemService.canResendFailedItems(ids);
        expect(fileItemService.hasValidItemFile).toBeCalledTimes(2);
      });
    });

    describe('resendFailedItems()', () => {
      it('should call file item service with correct parameter', async () => {
        const ids = [-2078572554, -801456138, -1];
        fileItemService.resendFailedFile = jest.fn();
        await itemService.resendFailedItems(ids);
        expect(fileItemService.resendFailedFile).toBeCalledTimes(2);
      });
    });

    describe('isFileExists()', () => {
      it('should call file item service with correct parameter', async () => {
        fileItemService.isFileExists = jest.fn();
        await itemService.isFileExists(groupId, file.name);
        expect(fileItemService.isFileExists).toBeCalledWith(groupId, file.name);
      });
    });

    describe('canUploadFiles()', () => {
      it('should call file item service with correct parameter', () => {
        fileItemService.canUploadFiles = jest.fn();
        itemService.canUploadFiles(groupId, [file], true);
        expect(fileItemService.canUploadFiles).toBeCalledWith(
          groupId,
          [file],
          true,
        );
      });
    });

    describe('getUploadProgress()', () => {
      it('should call file item service with correct parameter', () => {
        fileItemService.getUploadProgress = jest.fn();
        itemService.getUploadProgress(itemFile.id);
        expect(fileItemService.getUploadProgress).toBeCalledWith(itemFile.id);
      });
    });

    describe('getItemsSendingStatus()', () => {
      it('should call file item service with correct parameter', () => {
        fileItemService.getItemsSendingStatus = jest.fn();
        itemService.getItemsSendingStatus([itemFile.id]);
        expect(fileItemService.getItemsSendingStatus).toBeCalledWith([
          itemFile.id,
        ]);
      });
    });

    describe('cleanUploadingFiles()', () => {
      it('should call file item service with correct parameter', () => {
        fileItemService.cleanUploadingFiles = jest.fn();
        itemService.cleanUploadingFiles(groupId, [itemFile.id]);
        expect(fileItemService.cleanUploadingFiles).toBeCalledWith(groupId, [
          itemFile.id,
        ]);
      });
    });
  });

  describe('getItems()', () => {
    it('should controller with correct parameter', async () => {
      Object.assign(itemService, {
        _itemServiceController: itemServiceController,
      });

      const options = {
        groupId: 1,
        typeId: 10,
        limit: 10,
        offsetItemId: 0,
        sortKey: 'name',
        desc: true,
      };

      itemServiceController.getItems = jest.fn();

      itemService.getItems(options);

      expect(itemServiceController.getItems).toBeCalledWith(options);
    });
  });

  describe('createLocalItem()', () => {
    it('should controller with correct parameter', async () => {
      Object.assign(itemService, {
        _itemServiceController: itemServiceController,
      });

      itemServiceController.createLocalItem = jest.fn();

      await itemService.createLocalItem({
        id: -1,
        created_at: 1234,
        modified_at: 1234,
        creator_id: 2222,
        is_new: false,
        deactivated: false,
        version: 1,
        group_ids: [1],
        post_ids: [1],
        company_id: 1,
        name: 'test name',
        type_id: 1,
        type: 'jpg',
        versions: [],
      });

      expect(itemServiceController.createLocalItem).toBeCalledWith({
        id: -1,
        created_at: 1234,
        modified_at: 1234,
        creator_id: 2222,
        is_new: false,
        deactivated: false,
        version: 1,
        group_ids: [1],
        post_ids: [1],
        company_id: 1,
        name: 'test name',
        type_id: 1,
        type: 'jpg',
        versions: [],
      });
    });
  });

  describe('updateLocalItem()', () => {
    it('should controller with correct parameter', async () => {
      Object.assign(itemService, {
        _itemServiceController: itemServiceController,
      });

      itemServiceController.updateLocalItem = jest.fn();

      await itemService.updateLocalItem({
        id: 1,
        created_at: 1234,
        modified_at: 1234,
        creator_id: 2222,
        is_new: false,
        deactivated: false,
        version: 1,
        group_ids: [1],
        post_ids: [1],
        company_id: 1,
        name: 'test name',
        type_id: 1,
        type: 'jpg',
        versions: [],
      });
      expect(itemServiceController.updateLocalItem).toBeCalledWith({
        id: 1,
        created_at: 1234,
        modified_at: 1234,
        creator_id: 2222,
        is_new: false,
        deactivated: false,
        version: 1,
        group_ids: [1],
        post_ids: [1],
        company_id: 1,
        name: 'test name',
        type_id: 1,
        type: 'jpg',
        versions: [],
      });
    });
  });

  describe('deleteLocalItem()', () => {
    it('should controller with correct parameter', async () => {
      Object.assign(itemService, {
        _itemServiceController: itemServiceController,
      });

      itemServiceController.deleteLocalItem = jest.fn();

      itemService.deleteLocalItem(1);

      expect(itemServiceController.deleteLocalItem).toBeCalledWith(1);
    });
  });

  describe('getByPosts', () => {
    const itemDao = {
      batchGet: jest.fn(),
    };

    const entitySourceController = {
      batchGet: jest.fn(),
    };

    beforeEach(() => {
      clearMocks();
      setup();
      daoManager.getDao = jest.fn().mockReturnValue(itemDao);
      itemService.getEntitySource = jest
        .fn()
        .mockReturnValue(entitySourceController);
    });

    it('should call dao method with right id array', async () => {
      await itemService.getByPosts([
        postFactory.build({ item_ids: undefined }),
      ]);
      expect(entitySourceController.batchGet).not.toBeCalled();
    });

    it('should call dao method with right id array', async () => {
      await itemService.getByPosts([
        postFactory.build({ item_ids: [1, 2, 3] }),
      ]);
      expect(entitySourceController.batchGet).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('should call dao method with right id array', async () => {
      await itemService.getByPosts([
        postFactory.build({ item_ids: [1, 2, 3], at_mention_item_ids: [5] }),
      ]);
      expect(entitySourceController.batchGet).toHaveBeenCalledWith([
        1,
        2,
        3,
        5,
      ]);
    });

    it('should call dao method with right id array', async () => {
      await itemService.getByPosts([
        postFactory.build({
          item_ids: [1, 2, 3],
          at_mention_item_ids: [1, 2, 5],
        }),
      ]);
      expect(entitySourceController.batchGet).toHaveBeenCalledWith([
        1,
        2,
        3,
        5,
      ]);
    });
  });

  describe('doNotRenderItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should controller with correct parameter', async () => {
      itemActionController.doNotRenderItem = jest.fn();
      const itemId = 1;
      await itemService.doNotRenderItem(itemId, 'file');
      expect(itemActionController.doNotRenderItem).toBeCalled();
    });
  });

  describe('getGroupItemsCount', () => {
    beforeEach(() => {
      clearMocks();
      setup();

      Object.assign(itemService, {
        _itemServiceController: itemServiceController,
      });
    });

    it('should call itemServiceController to get data', async () => {
      const gId = 10;
      const cnt = 111;
      itemServiceController.getGroupItemsCount = jest
        .fn()
        .mockResolvedValue(cnt);
      const res = await itemService.getGroupItemsCount(
        gId,
        TypeDictionary.TYPE_ID_PAGE,
      );
      expect(res).toBe(cnt);
      expect(itemServiceController.getGroupItemsCount).toBeCalledWith(
        gId,
        TypeDictionary.TYPE_ID_PAGE,
        undefined,
      );
    });
  });

  describe('handleIncomingData', () => {
    beforeEach(() => {
      clearMocks();
      setup();

      Object.assign(itemService, {
        _itemServiceController: itemServiceController,
      });

      itemServiceController.handleSanitizedItems = jest.fn();
    });

    it('should insert transformed data', async () => {
      const item = rawItemFactory.build({ _id: 1 });
      delete item.id;
      await itemService.handleIncomingData([item]);
      expect(itemServiceController.handleSanitizedItems).toHaveBeenCalled();
      expect(baseHandleData).toHaveBeenCalled();
      expect(transform).toHaveBeenCalledTimes(1);
      expect(daoManager.getDao).toHaveBeenCalled();
    });

    it('should insert nothing', async () => {
      const ret = await itemService.handleIncomingData([]);
      expect(itemServiceController.handleSanitizedItems).not.toHaveBeenCalled();
      expect(baseHandleData).not.toHaveBeenCalled();
      expect(ret).toBeUndefined();
    });
  });
});
