/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-07 20:42:02
 * Copyright © RingCentral. All rights reserved.
 */

import { FileItemController } from '../../controller/FileItemController';
import { FileUploadController } from '../../controller/FileUploadController';
import { daoManager } from '../../../../../../dao';
import { IItemService } from '../../../../service/IItemService';
import { FileItemDao } from '../../dao/FileItemDao';
import { FileItemService } from '../FileItemService';
import { FileItem } from '../../entity';

jest.mock('../../controller/FileUploadController');
jest.mock('../../controller/FileItemController');
jest.mock('../../../../../../dao');
jest.mock('../../dao/FileItemDao');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('FileItemService', () => {
  let fileUploadController: FileUploadController;
  let fileItemController: FileItemController;
  const itemService = {};
  let fileItemService: FileItemService;
  let fileItemDao: FileItemDao;
  function setup() {
    fileItemDao = new FileItemDao(null);
    daoManager.getDao = jest.fn().mockReturnValue(fileItemDao);
    fileUploadController = new FileUploadController(null, null, null);
    fileItemController = new FileItemController(null, null);
    fileItemService = new FileItemService(itemService as IItemService);
    Object.defineProperty(fileItemService, 'fileUploadController', {
      get: jest.fn(() => fileUploadController),
    });

    Object.defineProperty(fileItemService, 'fileItemController', {
      get: jest.fn(() => fileItemController),
    });
  }

  function setUpData() {
    const sendStatuses = [1, 2, 3];
    const progress = { id: 11111 };
    const fileItem = {
      company_id: 139265,
      created_at: 1546857116347,
      creator_id: 7307267,
      deactivated: false,
      function_id: 'file',
      group_ids: [842096646],
      id: 536412170,
      is_new: false,
      model_size: 0,
      modified_at: 1546857116623,
      name: '人月神话（CN）.pdf',
      post_ids: [3361800196],
      source: 'upload',
      type: 'application/pdf',
      type_id: 10,
      version: 2271038454890496,
      versions: [],
    } as FileItem;
    const fileItemIds = [10, 11, 12];
    const fileId = 10;
    const groupId = 100101;
    const file = { name: 'name', size: 1010, type: 't' } as File;
    return {
      sendStatuses,
      progress,
      fileItem,
      fileItemIds,
      fileId,
      file,
      groupId,
    };
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('getSortedIds', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call fileItemDao and get result', async () => {
      const options = {
        groupId: 1,
        typeId: 10,
        limit: 10,
        offsetItemId: 0,
        sortKey: 'name',
        desc: true,
      };
      fileItemDao.getSortedIds = jest.fn().mockResolvedValue([1]);
      const res = await fileItemService.getSortedIds(options);
      expect(fileItemDao.getSortedIds).toBeCalledWith(options);
      expect(res).toEqual([1]);
    });
  });

  describe('sendItemFile', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call api in fileUploadController ', async () => {
      const { groupId, file } = setUpData();
      fileUploadController.sendItemFile = jest.fn();
      await fileItemService.sendItemFile(groupId, file, true);
      expect(fileUploadController.sendItemFile).toBeCalledWith(
        groupId,
        file,
        true,
      );
    });
  });

  describe('deleteFileCache', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call api in fileUploadController ', () => {
      const { fileId } = setUpData();
      fileUploadController.deleteFileCache = jest.fn();
      fileItemService.deleteFileCache(fileId);
      expect(fileUploadController.deleteFileCache).toBeCalledWith(fileId);
    });
  });

  describe('sendItemData', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call api in fileUploadController ', async () => {
      const { fileItemIds, groupId } = setUpData();
      fileUploadController.sendItemData = jest.fn();
      await fileItemService.sendItemData(groupId, fileItemIds);
      expect(fileUploadController.sendItemData).toBeCalledWith(
        groupId,
        fileItemIds,
      );
    });
  });

  describe('getFileItemVersion', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call api in fileUploadController ', async () => {
      const { fileItem } = setUpData();
      fileUploadController.getFileVersion = jest.fn();
      await fileItemService.getFileItemVersion(fileItem);
      expect(fileUploadController.getFileVersion).toBeCalledWith(fileItem);
    });
  });

  describe('cancelUpload', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call api in fileUploadController ', async () => {
      const { fileId } = setUpData();
      fileUploadController.cancelUpload = jest.fn();
      await fileItemService.cancelUpload(fileId);
      expect(fileUploadController.cancelUpload).toBeCalledWith(fileId);
    });
  });

  describe('getUploadItems', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call api in fileUploadController ', async () => {
      const { groupId, fileItem } = setUpData();
      fileUploadController.getUploadItems = jest
        .fn()
        .mockResolvedValue([fileItem]);
      const res = await fileItemService.getUploadItems(groupId);
      expect(fileUploadController.getUploadItems).toBeCalledWith(groupId);
      expect(res).toEqual([fileItem]);
    });
  });

  describe('hasValidItemFile', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call api in fileUploadController ', async () => {
      const { fileId } = setUpData();
      fileUploadController.hasValidItemFile = jest
        .fn()
        .mockResolvedValue(false);
      expect(await fileItemService.hasValidItemFile(fileId)).toBeFalsy();
      expect(fileUploadController.hasValidItemFile).toBeCalledWith(fileId);
    });
  });

  describe('resendFailedFile', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call api in fileUploadController ', async () => {
      const { fileId } = setUpData();
      fileUploadController.resendFailedFile = jest.fn();
      await fileItemService.resendFailedFile(fileId);
      expect(fileUploadController.resendFailedFile).toBeCalledWith(fileId);
    });
  });

  describe('canUploadFiles', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call api in fileUploadController ', () => {
      const { groupId, file } = setUpData();
      fileUploadController.canUploadFiles = jest.fn().mockReturnValue(true);
      expect(
        fileItemService.canUploadFiles(groupId, [file], true),
      ).toBeTruthy();
      expect(fileUploadController.canUploadFiles).toBeCalledWith(
        groupId,
        [file],
        true,
      );
    });
  });

  describe('getUploadProgress', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call api in fileUploadController ', () => {
      const { fileId, progress } = setUpData();
      fileUploadController.getUploadProgress = jest
        .fn()
        .mockReturnValue([progress]);
      expect(fileItemService.getUploadProgress(fileId)).toEqual([progress]);
      expect(fileUploadController.getUploadProgress).toBeCalledWith(fileId);
    });
  });

  describe('getItemsSendingStatus', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call api in fileUploadController ', () => {
      const { fileId, sendStatuses } = setUpData();
      fileUploadController.getItemsSendStatus = jest
        .fn()
        .mockReturnValue(sendStatuses);
      expect(fileItemService.getItemsSendingStatus([fileId])).toEqual(
        sendStatuses,
      );
      expect(fileUploadController.getItemsSendStatus).toBeCalledWith([fileId]);
    });
  });

  describe('cleanUploadingFiles', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call api in fileUploadController ', () => {
      const { groupId, fileId } = setUpData();
      fileUploadController.cleanUploadingFiles = jest.fn();
      fileItemService.cleanUploadingFiles(groupId, [fileId]);
      expect(fileUploadController.cleanUploadingFiles).toBeCalledWith(groupId, [
        fileId,
      ]);
    });
  });

  // async updateItem(file: FileItem) {
  //   const sanitizedDao = daoManager.getDao<FileItemDao>(FileItemDao);
  //   await sanitizedDao.update(this._toSanitizedFile(file));
  // }

  describe('updateItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should sanitize item and update it', async () => {
      const { fileItem } = setUpData();
      fileItemDao.update = jest.fn();
      await fileItemService.updateItem(fileItem);
      expect(fileItemDao.update).toBeCalledWith({
        id: fileItem.id,
        group_ids: fileItem.group_ids,
        created_at: fileItem.created_at,
        name: fileItem.name,
        type: fileItem.type,
        post_ids: fileItem.post_ids,
      });
    });
  });

  describe('deleteItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should sanitize item and update it', async () => {
      const { fileItem } = setUpData();
      fileItemDao.delete = jest.fn();
      await fileItemService.deleteItem(fileItem.id);
      expect(fileItemDao.delete).toBeCalledWith(fileItem.id);
    });
  });

  describe('createItem', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should sanitize item and update it', async () => {
      const { fileItem } = setUpData();
      fileItemDao.put = jest.fn();
      await fileItemService.createItem(fileItem);
      expect(fileItemDao.put).toBeCalledWith({
        id: fileItem.id,
        group_ids: fileItem.group_ids,
        created_at: fileItem.created_at,
        name: fileItem.name,
        type: fileItem.type,
        post_ids: fileItem.post_ids,
      });
    });
  });

  describe('getSubItemsCount()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call file item dao to get file count', async () => {
      fileItemDao.getGroupItemCount = jest.fn();
      await fileItemService.getSubItemsCount(111, undefined);
      expect(fileItemDao.getGroupItemCount).toBeCalledWith(111, undefined);
    });
  });

  describe('isFileExists', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call api in fileItemController', async () => {
      const { groupId, file } = setUpData();
      fileItemController.isFileExists = jest.fn().mockResolvedValue(false);
      expect(
        await fileItemService.isFileExists(groupId, file.name),
      ).toBeFalsy();
      expect(fileItemController.isFileExists).toBeCalledWith(
        groupId,
        file.name,
      );
    });
  });
});
