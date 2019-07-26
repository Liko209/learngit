/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-04 14:08:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ItemService } from '../ItemService';
import { ItemServiceController } from '../../controller/ItemServiceController';
import { FileItemService } from '../../module/file';
import { NoteItemService } from '../../module/note/service';
import { daoManager } from '../../../../dao';
import { ItemFile } from '../../entity';
import { postFactory, rawItemFactory } from '../../../../__tests__/factories';
import { ItemActionController } from '../../controller/ItemActionController';
import { transform, baseHandleData } from '../../../../service/utils';
import { TypeDictionary } from '../../../../utils';
import { ItemSyncController } from '../../controller/ItemSyncController';

jest.mock('../../../../service/utils', () => ({
  baseHandleData: jest.fn(),
  transform: jest.fn(),
}));

jest.mock('../../module/note/service');
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
  let noteItemService: NoteItemService;
  let itemActionController: ItemActionController;
  const itemSyncController = new ItemSyncController(null);

  function setup() {
    noteItemService = new NoteItemService();
    itemService = new ItemService();
    itemServiceController = new ItemServiceController(null, null);
    fileItemService = new FileItemService();
    itemActionController = new ItemActionController(undefined, undefined);

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
      expect(itemSyncController.requestSyncGroupItems).toHaveBeenCalledWith(
        groupId,
      );
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

    describe('uploadFileToServer', () => {
      it('should call with right parameter', async () => {
        await itemService.uploadFileToServer({} as any);
        expect(fileItemService.uploadFileToServer).toHaveBeenCalled();
      });
    });

    describe('initialUploadItemsFromDraft', () => {
      it('should call file item service with correct parameter', async () => {
        expect.assertions(1);
        fileItemService.initialUploadItemsFromDraft = jest.fn();
        await itemService.initialUploadItemsFromDraft(groupId);
        expect(
          fileItemService.initialUploadItemsFromDraft,
        ).toHaveBeenCalledWith(groupId);
      });
    });

    describe('getThumbsUrlWithSize', () => {
      it('should call file item service with correct parameter', async () => {
        expect.assertions(2);
        fileItemService.getThumbsUrlWithSize = jest.fn().mockResolvedValue('a');
        const res = await itemService.getThumbsUrlWithSize(1, 2, 3);
        expect(fileItemService.getThumbsUrlWithSize).toHaveBeenCalledWith(
          1,
          2,
          3,
        );
        expect(res).toBe('a');
      });
    });
    describe('editFileName()', () => {
      it('should call with correct parameter', async () => {
        fileItemService.editFileName = jest.fn();
        await itemService.editFileName(1, 'newName');
        expect(fileItemService.editFileName).toHaveBeenCalledWith(1, 'newName');
      });
    });

    describe('deleteFile()', () => {
      it('should call with correct parameter', async () => {
        fileItemService.deleteFile = jest.fn();
        await itemService.deleteFile(1, 1);
        expect(fileItemService.deleteFile).toHaveBeenCalledWith(1, 1);
      });
    });

    describe('sendItemFile()', () => {
      it('should call file item service with correct parameter', async () => {
        expect.assertions(1);
        fileItemService.sendItemData = jest.fn();
        await itemService.sendItemFile(groupId, file, false);
        expect(fileItemService.sendItemFile).toHaveBeenCalledWith(
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
        expect(fileItemService.deleteFileCache).toHaveBeenCalledWith(itemId);
      });
    });

    describe('getItemVersion()', () => {
      it('should call file item service with correct parameter', async () => {
        fileItemService.getFileItemVersion = jest.fn();
        await itemService.getItemVersion(itemFile);
        expect(fileItemService.getFileItemVersion).toHaveBeenCalledWith(
          itemFile,
        );
      });
    });

    describe('cancelUpload()', () => {
      it('should call file item service with correct parameter', async () => {
        fileItemService.cancelUpload = jest.fn();
        await itemService.cancelUpload(itemFile.id);
        expect(fileItemService.cancelUpload).toHaveBeenCalledWith(itemFile.id);
      });
    });

    describe('getUploadItems()', () => {
      it('should call file item service with correct parameter', () => {
        fileItemService.getUploadItems = jest.fn();
        itemService.getUploadItems(groupId);
        expect(fileItemService.getUploadItems).toHaveBeenCalledWith(groupId);
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
        expect(fileItemService.hasValidItemFile).toHaveBeenCalledTimes(2);
      });
    });

    describe('resendFailedItems()', () => {
      it('should call file item service with correct parameter', async () => {
        const ids = [-2078572554, -801456138, -1];
        fileItemService.resendFailedFile = jest.fn();
        await itemService.resendFailedItems(ids);
        expect(fileItemService.resendFailedFile).toHaveBeenCalledTimes(2);
      });
    });

    describe('isFileExists()', () => {
      it('should call file item service with correct parameter', async () => {
        fileItemService.isFileExists = jest.fn();
        await itemService.isFileExists(groupId, file.name);
        expect(fileItemService.isFileExists).toHaveBeenCalledWith(
          groupId,
          file.name,
        );
      });
    });

    describe('canUploadFiles()', () => {
      it('should call file item service with correct parameter', () => {
        fileItemService.canUploadFiles = jest.fn();
        itemService.canUploadFiles(groupId, [file], true);
        expect(fileItemService.canUploadFiles).toHaveBeenCalledWith(
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
        expect(fileItemService.getUploadProgress).toHaveBeenCalledWith(
          itemFile.id,
        );
      });
    });

    describe('getItemsSendingStatus()', () => {
      it('should call file item service with correct parameter', () => {
        fileItemService.getItemsSendingStatus = jest.fn();
        itemService.getItemsSendingStatus([itemFile.id]);
        expect(fileItemService.getItemsSendingStatus).toHaveBeenCalledWith([
          itemFile.id,
        ]);
      });
    });

    describe('cleanUploadingFiles()', () => {
      it('should call file item service with correct parameter', () => {
        fileItemService.cleanUploadingFiles = jest.fn();
        itemService.cleanUploadingFiles(groupId, [itemFile.id]);
        expect(fileItemService.cleanUploadingFiles).toHaveBeenCalledWith(
          groupId,
          [itemFile.id],
        );
      });
    });

    describe('hasUploadingFiles', () => {
      it('should call file item service', () => {
        fileItemService.hasUploadingFiles = jest.fn().mockReturnValue(true);
        expect(itemService.hasUploadingFiles()).toBeTruthy();
        expect(fileItemService.hasUploadingFiles).toHaveBeenCalled();
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

      expect(itemServiceController.getItems).toHaveBeenCalledWith(options);
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
      expect(entitySourceController.batchGet).not.toHaveBeenCalled();
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

    it('should call dao method with item_ids have invalid id', async () => {
      await itemService.getByPosts([
        postFactory.build({ item_ids: [1, 2, 3, -1, -2, null] }),
      ]);
      expect(entitySourceController.batchGet).toHaveBeenCalledWith([1, 2, 3]);
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
      expect(itemActionController.doNotRenderItem).toHaveBeenCalled();
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
      expect(itemServiceController.getGroupItemsCount).toHaveBeenCalledWith(
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
    });

    it('should insert transformed data', async () => {
      const item = rawItemFactory.build({ _id: 1 });
      delete item.id;
      await itemService.handleIncomingData([item]);
      expect(baseHandleData).toHaveBeenCalled();
      expect(transform).toHaveBeenCalledTimes(1);
      expect(daoManager.getDao).toHaveBeenCalled();
    });

    it('should insert nothing', async () => {
      const ret = await itemService.handleIncomingData([]);
      expect(baseHandleData).not.toHaveBeenCalled();
      expect(ret).toBeUndefined();
    });
  });

  describe('NoteItemService', () => {
    beforeEach(() => {
      clearMocks();
      setup();

      Object.assign(itemService, {
        _itemServiceController: itemServiceController,
      });

      itemServiceController.getSubItemService = jest
        .fn()
        .mockImplementation(() => {
          return noteItemService;
        });
    });
    it('should call note item service to get note body', async () => {
      await itemService.getNoteBody(1);
      expect(noteItemService.getNoteBody).toHaveBeenCalledWith(1);
    });
  });
});
