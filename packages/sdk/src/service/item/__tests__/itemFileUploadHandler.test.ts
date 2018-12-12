import { ItemFile, Progress } from '../../../models';
import { ItemFileUploadHandler } from '../itemFileUploadHandler';
import AccountService from '../../account';
import { daoManager, ItemDao } from '../../../dao';
import ItemAPI from '../../../api/glip/item';
import handleData from '../handleData';
import { NetworkResultOk, NetworkResultErr } from '../../../api/NetworkResult';
import notificationCenter from '../../notificationCenter';
import { ItemService } from '../itemService';
import { ItemFileUploadStatus } from '../itemFileUploadStatus';
import { RequestHolder } from '../../../api/requestHolder';
import { SENDING_STATUS } from '../../constants';
import { SERVICE, ENTITY } from '../../eventKey';
import { BaseError } from '../../../utils';

jest.mock('../../../service/item');
jest.mock('../../../service/account');
jest.mock('../../../api/glip/item');
jest.mock('../../../dao');
jest.mock('../handleData');
jest.mock('../../notificationCenter');

type ProgressCallback = (e: ProgressEventInit) => any;

describe('ItemFileService', () => {
  let itemFileUploadHandler: ItemFileUploadHandler = undefined;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    itemFileUploadHandler = new ItemFileUploadHandler();
  });

  describe('sendItemFile()', () => {
    const groupId = 1;
    const userId = 2;
    const companyId = 3;
    const itemService = new ItemService();
    const accountService = new AccountService();
    const itemDao = new ItemDao(null);
    beforeEach(() => {
      daoManager.getDao.mockReturnValue(itemDao);
      ItemService.getInstance = jest.fn().mockReturnValue(itemService);
      AccountService.getInstance = jest.fn().mockReturnValue(accountService);
      accountService.getCurrentCompanyId.mockReturnValue(companyId);
      accountService.getCurrentUserId.mockReturnValue(userId);
      itemDao.put.mockImplementation(() => {});
      itemDao.update.mockImplementation(() => {});
      itemDao.delete.mockImplementation(() => {});
    });

    it('should return null when no file name in fromData', async () => {
      const file = new FormData();
      const result = await itemFileUploadHandler.sendItemFile(
        groupId,
        file,
        false,
      );
      expect(result).toBe(null);
    });

    const storedFile = {
      _id: 123,
      creator_id: 2588675,
      last_modified: 1542274244897,
      download_url: 'url/123.pdf',
      storage_url: 'url/123',
      stored_file_id: 5701644,
      size: 1111,
    };

    const mockStoredFileRes = new NetworkResultOk([storedFile], 200, undefined);

    const itemFile = {
      id: 1,
      versions: [storedFile],
    };

    it.each`
      fileName    | name        | type    | comment
      ${'123.ts'} | ${'123.ts'} | ${'ts'} | ${'has name and type'}
      ${'123'}    | ${'123'}    | ${''}   | ${'has name and no type'}
      ${''}       | ${''}       | ${''}   | ${'no name and no type'}
    `(
      'should return item with right name and type: $comment',
      async ({ fileName, name, type }) => {
        const file = new FormData();
        file.append('filename', fileName);
        jest
          .spyOn(itemFileUploadHandler, '_sendItemFile')
          .mockImplementationOnce(() => {});
        jest
          .spyOn(itemFileUploadHandler, '_preSaveItemFile')
          .mockImplementationOnce(() => {});

        const res = await itemFileUploadHandler.sendItemFile(
          groupId,
          file,
          false,
        );
        if (fileName) {
          expect(res.name).toBe(name);
          expect(res.type).toBe(type);
        } else {
          expect(res).toBeNull;
        }
      },
    );

    it('should call go updateItem when group has the file before', async (done: jest.DoneCallback) => {
      const existItems = [
        { id: 1, created_at: 1, versions: [] },
        { id: 4, created_at: 4, versions: [] },
        { id: 5, created_at: 5, versions: [] },
      ];

      const mockItemFileRes = new NetworkResultOk(itemFile, 200, undefined);
      itemDao.get.mockResolvedValue(itemFile);
      itemDao.getExistGroupFilesByName.mockResolvedValue(existItems);
      handleData.mockResolvedValue(null);
      ItemAPI.uploadFileItem.mockResolvedValue(mockStoredFileRes);
      ItemAPI.putItem.mockResolvedValue(mockItemFileRes);
      itemService.handlePartialUpdate = jest.fn();
      itemService.updatePreInsertItemStatus = jest.fn();

      const file = new FormData();
      const fileName = '123.pdf';
      file.append('filename', fileName);
      await itemFileUploadHandler.sendItemFile(groupId, file, true);

      setTimeout(() => {
        expect(itemService.handlePartialUpdate).toBeCalledTimes(1);
        expect(itemService.updatePreInsertItemStatus).toBeCalledTimes(1);
        expect(ItemAPI.putItem).toBeCalledTimes(1);
        expect(ItemAPI.sendFileItem).not.toHaveBeenCalled();
        expect(ItemAPI.putItem).toBeCalled();
        expect(ItemAPI.putItem).toBeCalledWith(
          1,
          'file',
          expect.objectContaining({
            _id: 1,
            created_at: 1,
            is_new: false,
            modified_at: expect.any(Number),
            versions: [
              {
                creator_id: 2588675,
                date: 1542274244897,
                download_url: 'url/123.pdf',
                size: 1111,
                stored_file_id: 123,
                url: 'url/123',
              },
            ],
          }),
        );
        expect(itemFileUploadHandler.getUploadItems).toHaveLength(1);
        done();
      });
    });

    it('should insert pseudo item to db and return pseudo item', async (done: jest.DoneCallback) => {
      const mockItemFileRes = new NetworkResultOk(itemFile, 200, undefined);
      itemDao.get.mockResolvedValue(itemFile);
      handleData.mockResolvedValue(null);
      ItemAPI.uploadFileItem.mockImplementation(
        (files: FormData, callback: ProgressCallback) => {
          callback({ lengthComputable: false, loaded: 0, total: 100 });
          callback({ lengthComputable: false, loaded: 10, total: 100 });
          return Promise.resolve(mockStoredFileRes);
        },
      ); // mockResolvedValue(mockStoredFileRes);
      ItemAPI.sendFileItem.mockResolvedValue(mockItemFileRes);
      itemService.handlePartialUpdate = jest.fn();
      itemService.updatePreInsertItemStatus = jest.fn();

      const file = new FormData();
      const fileName = '123.pdf';
      file.append('filename', fileName);
      const res = await itemFileUploadHandler.sendItemFile(
        groupId,
        file,
        false,
      );

      expect(res.id).toBeLessThan(0);
      expect(res.creator_id).toBe(userId);
      expect(res.group_ids).toEqual([groupId]);
      expect(res.deactivated).toBeFalsy;
      expect(res.company_id).toBe(companyId);
      expect(res.name).toBe(fileName);
      expect(res.type).toBe('pdf');

      setTimeout(() => {
        expect(ItemAPI.putItem).not.toHaveBeenCalled();
        expect(ItemAPI.sendFileItem).toBeCalledTimes(1);
        expect(itemDao.put).toBeCalledTimes(2);
        expect(itemDao.update).toBeCalledTimes(1);
        expect(itemDao.delete).toBeCalledTimes(1);
        expect(notificationCenter.emitEntityReplace).toBeCalled();
        expect(notificationCenter.emitEntityUpdate).toBeCalledWith(
          ENTITY.PROGRESS,
          [{ groupId: 1, id: expect.any(Number), loaded: 10, total: 100 }],
        );
        expect(itemService.handlePartialUpdate).toBeCalledTimes(1);
        expect(itemService.updatePreInsertItemStatus).toBeCalledTimes(1);

        done();
      });
    });

    it('should go to _handleItemFileSendFailed process when upload file failed ', async (done: jest.DoneCallback) => {
      const errResponse = new NetworkResultErr(
        new BaseError(1, 'error'),
        403,
        {},
      );

      itemDao.get.mockResolvedValue(itemFile);
      handleData.mockResolvedValue(null);
      ItemAPI.uploadFileItem.mockResolvedValue(errResponse);

      itemService.handlePartialUpdate = jest.fn();
      itemService.updatePreInsertItemStatus = jest.fn();

      const file = new FormData();
      const fileName = '123.pdf';
      file.append('filename', fileName);
      await itemFileUploadHandler.sendItemFile(groupId, file, false);

      setTimeout(() => {
        expect(ItemAPI.uploadFileItem).toBeCalled();
        expect(ItemAPI.sendFileItem).not.toBeCalled();
        expect(notificationCenter.emit).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          expect.anything(),
        );
        expect(itemService.handlePartialUpdate).toBeCalledTimes(1);
        expect(itemService.updatePreInsertItemStatus).toBeCalledWith(
          expect.any(Number),
          SENDING_STATUS.FAIL,
        );

        done();
      });
    });

    it('should go to _handleItemFileSendFailed process when send item failed ', async (done: jest.DoneCallback) => {
      const okRes = new NetworkResultOk(itemFile, 200, undefined);
      const errRes = new NetworkResultErr(new BaseError(1, 'error'), 403, {});
      ItemAPI.uploadFileItem.mockResolvedValue(okRes);
      ItemAPI.putItem.mockResolvedValue(errRes);

      jest
        .spyOn(itemFileUploadHandler, '_handleFileUploadSuccess')
        .mockImplementation(() => {});

      const file = new FormData();
      const fileName = '123.pdf';
      file.append('filename', fileName);
      await itemFileUploadHandler.sendItemFile(groupId, file, true);

      setTimeout(() => {
        expect(ItemAPI.uploadFileItem).toBeCalled();
        expect(ItemAPI.sendFileItem).toBeCalled();

        expect(notificationCenter.emit).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          expect.anything(),
        );
        expect(itemService.handlePartialUpdate).toBeCalledTimes(1);
        expect(itemService.updatePreInsertItemStatus).toBeCalledWith(
          expect.any(Number),
          SENDING_STATUS.FAIL,
        );

        done();
      });
    });
  });

  describe('cancelUpload()', () => {
    let progressCaches: Map<number, ItemFileUploadStatus> = undefined;
    let uploadingFiles = undefined;

    const itemDao = new ItemDao(null);
    beforeEach(() => {
      daoManager.getDao.mockReturnValue(itemDao);
      itemDao.put.mockImplementation(() => {});
      itemDao.update.mockImplementation(() => {});
      itemDao.delete.mockImplementation(() => {});
      ItemAPI.cancelUploadRequest.mockImplementation(() => {});

      progressCaches = new Map();
      const r: RequestHolder = { request: undefined };
      const p: Progress = { id: -3, total: 3, loaded: 5, groupId: 1 };
      const f = new FormData();
      const itemFileUploadStatus = {
        progress: p,
        requestHolder: r,
        file: f,
      } as ItemFileUploadStatus;
      progressCaches.set(-3, itemFileUploadStatus);
      progressCaches.set(-4, itemFileUploadStatus);

      uploadingFiles = new Map();
      const itemFiles = { id: -3 } as ItemFile;
      const itemFiles2 = { id: -4 } as ItemFile;
      uploadingFiles.set(1, [itemFiles]);
      uploadingFiles.set(2, [itemFiles2, itemFiles2, itemFiles2]);
      uploadingFiles.set(3, undefined);

      Object.assign(itemFileUploadHandler, {
        _progressCaches: progressCaches,
        _uploadingFiles: uploadingFiles,
      });
    });

    it('should not call cancel api and update when item id is not in progress', async () => {
      const itemId = 10;
      await itemFileUploadHandler.cancelUpload(itemId);
      expect(ItemAPI.cancelUploadRequest).not.toBeCalled();
      expect(notificationCenter.emitEntityDelete).toBeCalledWith(
        ENTITY.ITEM,
        expect.anything(),
      );
      expect(itemDao.delete).toBeCalledTimes(1);
      expect(uploadingFiles.get(1)).toHaveLength(1);
      expect(uploadingFiles.get(2)).toHaveLength(3);
      expect(progressCaches.get(-3)).not.toBeUndefined();
      expect(progressCaches.get(-4)).not.toBeUndefined();
    });

    it('should delete item and send notification', async () => {
      const itemId = -3;
      await itemFileUploadHandler.cancelUpload(itemId);
      expect(itemDao.delete).toBeCalledTimes(1);
      expect(ItemAPI.cancelUploadRequest).toBeCalledWith(expect.anything());
      expect(progressCaches.get(itemId)).toBeUndefined;
      expect(progressCaches.get(-4)).not.toBeUndefined;
      expect(uploadingFiles.get(1)).toEqual([]);
      expect(uploadingFiles.get(2)).not.toEqual([]);
      expect(notificationCenter.emitEntityDelete).toBeCalledWith(
        ENTITY.ITEM,
        expect.anything(),
      );
    });
  });

  describe('resendFailedFile', () => {
    const userId = 2;
    const companyId = 3;
    const itemService = new ItemService();
    const accountService = new AccountService();
    const itemDao = new ItemDao(null);
    beforeEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();

      itemFileUploadHandler = new ItemFileUploadHandler();
      daoManager.getDao.mockReturnValue(itemDao);
      ItemService.getInstance = jest.fn().mockReturnValue(itemService);
      AccountService.getInstance = jest.fn().mockReturnValue(accountService);
      accountService.getCurrentCompanyId.mockReturnValue(companyId);
      accountService.getCurrentUserId.mockReturnValue(userId);
      itemDao.put.mockImplementation(() => {});
      itemDao.update.mockImplementation(() => {});
      itemDao.delete.mockImplementation(() => {});
      itemService.updatePreInsertItemStatus = jest.fn();
      itemService.handlePartialUpdate = jest.fn();
    });

    it('should just upload item when file has beed send successfully', async (done: jest.DoneCallback) => {
      const itemWithVersion = {
        id: -10,
        group_ids: [1],
        is_new: true,
        name: 'name',
        versions: [
          {
            stored_file_id: 798197170188,
            url: 'url',
            download_url: 'download_url',
            date: 1543821518511,
            size: 13220,
            creator_id: 17814773763,
          },
        ],
      };

      const existItem = { id: 11, versions: [] };
      itemDao.getExistGroupFilesByName.mockResolvedValue([existItem]);
      itemDao.get.mockResolvedValue(itemWithVersion);
      const serverItemFile = {
        id: 11,
        versions: itemWithVersion.versions,
      };
      const mockItemFileRes = new NetworkResultOk(
        serverItemFile,
        200,
        undefined,
      );
      ItemAPI.putItem.mockResolvedValue(mockItemFileRes);
      const spyNewItem = jest.spyOn(itemFileUploadHandler, '_newItem');

      itemFileUploadHandler.resendFailedFile(itemWithVersion.id);

      setTimeout(() => {
        expect(itemService.updatePreInsertItemStatus).toBeCalledWith(
          itemWithVersion.id,
          SENDING_STATUS.INPROGRESS,
        );

        expect(itemDao.getExistGroupFilesByName).toBeCalledWith(
          itemWithVersion.group_ids[0],
          itemWithVersion.name,
          true,
        );
        expect(itemDao.delete).toBeCalledWith(itemWithVersion.id);
        expect(itemDao.put).toBeCalledWith(serverItemFile);
        expect(ItemAPI.putItem).toBeCalledTimes(1);
        expect(spyNewItem).not.toBeCalled();
        expect(notificationCenter.emitEntityReplace).toBeCalled();
        done();
      });
    });

    it('should upload file again when file has not beed sent', async (done: jest.DoneCallback) => {
      const itemWithOutVersion = {
        id: -3,
        group_ids: [1],
        is_new: true,
        name: 'name',
        versions: [],
      };
      itemDao.get.mockResolvedValue(itemWithOutVersion);
      const spySendItemFile = jest.spyOn(
        itemFileUploadHandler,
        '_sendItemFile',
      );
      spySendItemFile.mockImplementation(() => {});
      const spyUploadItem = jest.spyOn(itemFileUploadHandler, '_uploadItem');
      const spyUpdatePreInsertItemStatus = jest.spyOn(
        itemFileUploadHandler,
        '_updatePreInsertItemStatus',
      );
      spyUpdatePreInsertItemStatus.mockImplementation(() => {});
      const spyHandleFileItemSendFailed = jest.spyOn(
        itemFileUploadHandler,
        '_handleItemFileSendFailed',
      );
      const progressCaches: Map<number, ItemFileUploadStatus> = new Map();
      const r: RequestHolder = { request: undefined };
      const p: Progress = { id: -3, total: 3, loaded: 5, groupId: 1 };
      const f = new FormData();
      const itemFileUploadStatus = {
        progress: p,
        requestHolder: r,
        file: f,
      } as ItemFileUploadStatus;
      progressCaches.set(-3, itemFileUploadStatus);
      progressCaches.set(-4, itemFileUploadStatus);
      Object.assign(itemFileUploadHandler, {
        _progressCaches: progressCaches,
      });

      itemFileUploadHandler.resendFailedFile(itemWithOutVersion.id);
      setTimeout(() => {
        expect(spyUploadItem).not.toHaveBeenCalled();
        expect(spyHandleFileItemSendFailed).not.toBeCalled();
        expect(spySendItemFile).toBeCalled();
        expect(spyUpdatePreInsertItemStatus).toBeCalledWith(
          itemWithOutVersion.id,
          SENDING_STATUS.INPROGRESS,
        );
        expect(spySendItemFile).toBeCalledWith(
          itemWithOutVersion.group_ids[0],
          itemWithOutVersion,
          f,
          itemWithOutVersion.is_new,
        );
        done();
      });
    });

    it('should notify upload failed when the file does not exist in db', async (done: jest.DoneCallback) => {
      itemDao.get.mockResolvedValue(null);
      const spySendItemFile = jest.spyOn(
        itemFileUploadHandler,
        '_sendItemFile',
      );
      const spyUploadItem = jest.spyOn(itemFileUploadHandler, '_uploadItem');

      const itemId = 5;
      itemFileUploadHandler.resendFailedFile(itemId);

      setTimeout(() => {
        expect(spySendItemFile).not.toHaveBeenCalled();
        expect(spyUploadItem).not.toHaveBeenCalled();
        expect(itemService.updatePreInsertItemStatus).toBeCalledWith(
          itemId,
          SENDING_STATUS.FAIL,
        );
        expect(itemService.handlePartialUpdate).toBeCalledWith(
          {
            id: itemId,
            _id: itemId,
            status: SENDING_STATUS.FAIL,
          },
          undefined,
          expect.anything(),
        );
        expect(notificationCenter.emit).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          expect.anything(),
        );
        done();
      });
    });

    it('should notify upload failed when can not find the cache of the item', async (done: jest.DoneCallback) => {
      const itemId = 5;
      const item = { id: itemId, group_ids: [1], versions: [] };
      itemDao.get.mockResolvedValue(item);
      const spySendItemFile = jest.spyOn(
        itemFileUploadHandler,
        '_sendItemFile',
      );
      const spyUploadItem = jest.spyOn(itemFileUploadHandler, '_uploadItem');

      const spyUpdatePreInsertItemStatus = jest.spyOn(
        itemFileUploadHandler,
        '_updatePreInsertItemStatus',
      );
      spyUpdatePreInsertItemStatus.mockImplementation(() => {});

      const spyHandleFileItemSendFailed = jest.spyOn(
        itemFileUploadHandler,
        '_handleItemFileSendFailed',
      );
      spyHandleFileItemSendFailed.mockImplementation(() => {});

      itemFileUploadHandler.resendFailedFile(itemId);
      setTimeout(() => {
        expect(spySendItemFile).not.toHaveBeenCalled();
        expect(spyUploadItem).not.toHaveBeenCalled();
        expect(spyUpdatePreInsertItemStatus).toBeCalledWith(
          itemId,
          SENDING_STATUS.INPROGRESS,
        );
        expect(spyHandleFileItemSendFailed).toBeCalledWith(itemId);
        done();
      });
    });
  });

  describe('getUploadItems()', () => {
    let uploadingFiles: Map<number, ItemFile[]> = null;
    beforeEach(() => {
      uploadingFiles = new Map();
      itemFileUploadHandler = new ItemFileUploadHandler();
      const itemFiles = { id: 1 } as ItemFile;
      uploadingFiles.set(1, [itemFiles, itemFiles]);
      uploadingFiles.set(2, [itemFiles, itemFiles, itemFiles]);
      Object.assign(itemFileUploadHandler, {
        _uploadingFiles: uploadingFiles,
      });
    });

    it('should return recorded items by group id', () => {
      const gId = 1;
      const result = itemFileUploadHandler.getUploadItems(gId);
      expect(result).toEqual(uploadingFiles.get(gId));
      expect(result).toHaveLength(2);
    });

    it('should return [] when can not find the group id', () => {
      const gId = 666;
      const result = itemFileUploadHandler.getUploadItems(gId);
      expect(result).toEqual([]);
    });
  });

  describe('getUploadProgress()', () => {
    let progressCaches: Map<number, ItemFileUploadStatus> = undefined;
    beforeEach(() => {
      itemFileUploadHandler = new ItemFileUploadHandler();
      progressCaches = new Map();

      const r: RequestHolder = { request: undefined };
      const p: Progress = { id: 1, total: 3, loaded: 5, groupId: 1 };
      const itemFileUploadStatus = {
        progress: p,
        requestHolder: r,
      } as ItemFileUploadStatus;
      progressCaches.set(3, itemFileUploadStatus);
      progressCaches.set(4, itemFileUploadStatus);
      Object.assign(itemFileUploadHandler, {
        _progressCaches: progressCaches,
      });
    });
    it('should return recorded progress by item id', () => {
      const gId = 3;
      const result = itemFileUploadHandler.getUploadProgress(gId);
      expect(result).toEqual(progressCaches.get(gId).progress);
    });

    it('should return undefined when the id is not recorded', () => {
      const result = itemFileUploadHandler.getUploadProgress(666);
      expect(result).toBeUndefined();
    });
  });

  describe('cleanUploadingFiles()', () => {
    let uploadingFiles: Map<number, ItemFile[]> = null;
    beforeEach(() => {
      uploadingFiles = new Map();
      itemFileUploadHandler = new ItemFileUploadHandler();
      const itemFiles = { id: 1 } as ItemFile;
      uploadingFiles.set(1, [itemFiles]);
      uploadingFiles.set(2, [itemFiles]);
      Object.assign(itemFileUploadHandler, {
        _uploadingFiles: uploadingFiles,
      });
    });
    it('should clean recorded uploading files by groupid', () => {
      itemFileUploadHandler.cleanUploadingFiles(1);
      expect(uploadingFiles.get(1)).toBeUndefined();
      expect(uploadingFiles.get(2)).not.toBeUndefined();
    });
  });
});
