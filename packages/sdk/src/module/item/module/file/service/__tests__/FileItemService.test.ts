/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-07 20:42:02
 * Copyright © RingCentral. All rights reserved.
 */

import { FileItemController } from '../../controller/FileItemController';
import { FileUploadController } from '../../controller/FileUploadController';
import { daoManager } from '../../../../../../dao';
import { FileItemDao } from '../../dao/FileItemDao';
import { FileItemService } from '../FileItemService';
import { FileItem } from '../../entity';
import { FileActionController } from '../../controller/FileActionController';

jest.mock('../../controller/FileActionController');
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
  let fileItemService: FileItemService;
  let fileItemDao: FileItemDao;
  let fileActionController: FileActionController;
  function setup() {
    fileItemDao = new FileItemDao(null);
    daoManager.getDao = jest.fn().mockReturnValue(fileItemDao);
    fileActionController = new FileActionController(null);
    fileUploadController = new FileUploadController(null, null, null);
    fileItemController = new FileItemController();
    fileItemService = new FileItemService();
    Object.defineProperties(fileItemService, {
      fileUploadController: {
        get: jest.fn(() => fileUploadController),
      },
      fileActionController: {
        get: jest.fn(() => {
          return fileActionController;
        }),
      },
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

  describe('getThumbsUrlWithSize', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call api in fileActionController', async () => {
      fileActionController.getThumbsUrlWithSize = jest
        .fn()
        .mockResolvedValue('a');
      const res = await fileItemService.getThumbsUrlWithSize(1, 2, 3);
      expect(res).toBe('a');
      expect(fileActionController.getThumbsUrlWithSize).toBeCalledWith(1, 2, 3);
    });
  });

  describe('hasUploadingFiles', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call fileUploadController to get result', () => {
      fileUploadController.hasUploadingFiles = jest.fn().mockReturnValue(true);
      expect(fileItemService.hasUploadingFiles()).toBeTruthy();
      expect(fileUploadController.hasUploadingFiles).toBeCalled();
    });
  });

  describe('initialUploadItemsFromDraft', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call fileUploadController to get result', () => {
      const groupId = 10;
      fileUploadController.initialUploadItemsFromDraft = jest.fn();
      fileItemService.initialUploadItemsFromDraft(groupId);
      expect(fileUploadController.initialUploadItemsFromDraft).toBeCalled();
    });
  });
});
