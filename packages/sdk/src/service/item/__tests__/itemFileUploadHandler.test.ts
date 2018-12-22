import { BaseResponse, NETWORK_FAIL_TYPE } from 'foundation';
import { ItemFile, Progress } from '../../../models';
import { ItemFileUploadHandler } from '../itemFileUploadHandler';
import AccountService from '../../account';
import { daoManager, ItemDao } from '../../../dao';
import ItemAPI from '../../../api/glip/item';
import handleData from '../handleData';
import { ApiResultOk, ApiResultErr } from '../../../api/ApiResult';
import notificationCenter from '../../notificationCenter';
import { ItemService } from '../itemService';
import { ItemFileUploadStatus } from '../itemFileUploadStatus';
import { RequestHolder } from '../../../api/requestHolder';
import { SENDING_STATUS } from '../../constants';
import { SERVICE, ENTITY } from '../../eventKey';
import { BaseError } from '../../../utils';
import { isInBeta } from '../../account/clientConfig';

jest.mock('../../account/clientConfig');
jest.mock('../../../service/item');
jest.mock('../../../service/account');
jest.mock('../../../api/glip/item');
jest.mock('../../../dao');
jest.mock('../handleData');
jest.mock('../../notificationCenter');

type ProgressCallback = (e: ProgressEventInit) => any;

describe('ItemFileUploadHandler', () => {
  let itemFileUploadHandler: ItemFileUploadHandler = undefined;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    itemFileUploadHandler = new ItemFileUploadHandler();
  });

  describe('sendItemFile()', () => {
    isInBeta.mockReturnValue(false);
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

    it('should return null when no file in fromData', async () => {
      const file = undefined as File;
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

    const mockStoredFileRes = new ApiResultOk([storedFile], {
      status: 200,
      headers: {},
    } as BaseResponse);

    const itemFile = {
      id: 1,
      versions: [storedFile],
    };

    it('should insert pseudo item to db and return pseudo item', async (done: jest.DoneCallback) => {
      const mockItemFileRes = new ApiResultOk(itemFile, {
        status: 200,
        headers: {},
      } as BaseResponse);
      itemDao.get.mockResolvedValue(itemFile);
      handleData.mockResolvedValue(null);
      ItemAPI.uploadFileItem.mockImplementation(
        (files: FormData, callback: ProgressCallback) => {
          callback({ lengthComputable: false, loaded: 0, total: 100 });
          callback({ lengthComputable: false, loaded: 10, total: 100 });
          return Promise.resolve(mockStoredFileRes);
        },
      ); // mockResolvedValue(mockStoredFileRes);
      itemService.handlePartialUpdate = jest.fn();

      const file = { name: '1.ts', type: 'ts', size: 123 } as File;
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
      expect(res.type_id).toBe(10);

      setTimeout(() => {
        expect(ItemAPI.putItem).not.toHaveBeenCalled();
        expect(ItemAPI.sendFileItem).not.toBeCalledTimes(1);
        expect(itemDao.put).toBeCalledTimes(1);

        expect(notificationCenter.emitEntityUpdate).toBeCalledWith(
          ENTITY.PROGRESS,
          [{ groupId: 1, id: expect.any(Number), loaded: 10, total: 100 }],
        );
        expect(itemService.handlePartialUpdate).toBeCalledTimes(1);
        expect(notificationCenter.emit).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          {
            status: SENDING_STATUS.INPROGRESS,
            preInsertId: expect.any(Number),
            updatedId: expect.any(Number),
          },
        );
        done();
      },         1000);
    });

    it('should go to _handleItemFileSendFailed process when upload file failed ', async (done: jest.DoneCallback) => {
      const errResponse = new ApiResultErr(new BaseError(1, 'error'), {
        status: 200,
        headers: {},
      } as BaseResponse);

      itemDao.get.mockResolvedValue(itemFile);
      handleData.mockResolvedValue(null);
      ItemAPI.uploadFileItem.mockResolvedValue(errResponse);

      itemService.handlePartialUpdate = jest.fn();

      const file = new FormData();
      file.append('file', { name: '1.ts', type: 'ts' } as File);
      await itemFileUploadHandler.sendItemFile(groupId, file, false);
      const fileItem = itemFileUploadHandler.getUploadItems(groupId)[0];
      setTimeout(() => {
        expect(ItemAPI.uploadFileItem).toBeCalled();
        expect(ItemAPI.sendFileItem).not.toBeCalled();
        expect(notificationCenter.emit).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          expect.anything(),
        );
        expect(itemFileUploadHandler.getItemsSendStatus([fileItem.id])).toEqual(
          [SENDING_STATUS.FAIL],
        );
        expect(
          itemFileUploadHandler.getUploadProgress(fileItem.id).loaded,
        ).toBe(-1);
        done();
      },         1000);
    });

    it('should not handle failed result when the request is failed because the user canceled it.  ', async (done: jest.DoneCallback) => {
      const errRes = new ApiResultErr(new BaseError(1, 'error'), {
        status: 403,
        statusText: NETWORK_FAIL_TYPE.CANCELLED,
        headers: {},
      } as BaseResponse);
      ItemAPI.uploadFileItem.mockResolvedValue(errRes);
      itemService.handlePartialUpdate = jest.fn();

      jest
        .spyOn(itemFileUploadHandler, '_handleFileUploadSuccess')
        .mockImplementation(() => {});

      const file = new FormData();
      file.append('file', { name: '1.ts', type: 'ts' } as File);
      await itemFileUploadHandler.sendItemFile(groupId, file, true);

      setTimeout(() => {
        expect(ItemAPI.uploadFileItem).toBeCalled();
        expect(ItemAPI.sendFileItem).not.toBeCalled();

        expect(notificationCenter.emit).not.toBeCalled();
        expect(itemService.handlePartialUpdate).not.toBeCalled();

        done();
      },         1000);
    });
  });

  describe('uploadFileToAmazonS3', () => {
    const itemDao = new ItemDao(null);
    const accountService = new AccountService();

    beforeEach(() => {
      itemFileUploadHandler = new ItemFileUploadHandler();

      isInBeta.mockReturnValue(true);

      const userId = 2;
      const companyId = 3;
      AccountService.getInstance = jest.fn().mockReturnValue(accountService);
      accountService.getCurrentCompanyId.mockReturnValue(companyId);
      accountService.getCurrentUserId.mockReturnValue(userId);

      daoManager.getDao.mockReturnValue(itemDao);
      itemDao.put.mockImplementation(() => {});
      itemDao.update.mockImplementation(() => {});
      itemDao.delete.mockImplementation(() => {});
    });

    function uploadFileToAmazonS3_setUp() {
      const formFile = new FormData();
      formFile.append('file', {
        name: '1.ts',
        type: 'ts',
        size: 123123,
      } as File);

      const policy = {
        post_url: 'https://glipdev-qa.s3-accelerate.amazonaws.com/',
        signed_post_form: {
          key: 'web/customer_files/493912076/star-wars-wallpaper-3.jpg',
        },
      };

      const okRes = new ApiResultOk(policy, {
        status: 200,
        headers: {},
      } as BaseResponse);

      const errRes = new ApiResultErr(new BaseError(1, 'error'), {
        status: 403,
        headers: {},
      } as BaseResponse);

      const groupId = 123123;

      return {
        groupId,
        formFile,
        okRes,
        errRes,
      };
    }

    it('should go to handle send file failed when request amazon s3 policy failed', async (done: jest.DoneCallback) => {
      expect.assertions(3);
      const { groupId, errRes, okRes, formFile } = uploadFileToAmazonS3_setUp();

      const spyHandleFailed = jest.spyOn(
        itemFileUploadHandler,
        '_handleItemFileSendFailed',
      );
      spyHandleFailed.mockImplementationOnce(() => {});

      ItemAPI.requestAmazonFilePolicy.mockResolvedValue(errRes);
      ItemAPI.uploadFileToAmazonS3.mockResolvedValue(okRes);

      const result = await itemFileUploadHandler.sendItemFile(
        groupId,
        formFile,
        false,
      );
      setTimeout(() => {
        expect(ItemAPI.requestAmazonFilePolicy).toBeCalled();
        expect(ItemAPI.uploadFileToAmazonS3).not.toBeCalled();
        expect(spyHandleFailed).toHaveBeenCalled();
        done();
      });
    });

    it('should notify send file failed when upload file to amazon s3 failed', async (done: jest.DoneCallback) => {
      const { groupId, errRes, okRes, formFile } = uploadFileToAmazonS3_setUp();

      const spyHandleSuccess = jest.spyOn(
        itemFileUploadHandler,
        '_handleFileUploadSuccess',
      );
      spyHandleSuccess.mockImplementationOnce(() => {});

      const spyHandleFailed = jest.spyOn(
        itemFileUploadHandler,
        '_handleItemFileSendFailed',
      );
      spyHandleFailed.mockImplementationOnce(() => {});

      ItemAPI.requestAmazonFilePolicy.mockResolvedValue(okRes);
      ItemAPI.uploadFileToAmazonS3.mockResolvedValue(errRes);

      const result = await itemFileUploadHandler.sendItemFile(
        groupId,
        formFile,
        false,
      );
      setTimeout(() => {
        expect(ItemAPI.requestAmazonFilePolicy).toBeCalled();
        expect(ItemAPI.uploadFileToAmazonS3).toBeCalled();
        expect(spyHandleSuccess).not.toBeCalled();
        expect(spyHandleFailed).toBeCalled();
        done();
      });
    });

    it('should handle send file success when request policy and upload are both success', async (done: jest.DoneCallback) => {
      const { groupId, okRes, formFile } = uploadFileToAmazonS3_setUp();

      const spyHandleSuccess = jest.spyOn(
        itemFileUploadHandler,
        '_handleFileUploadSuccess',
      );
      spyHandleSuccess.mockImplementationOnce(() => {});

      const spyHandleFailed = jest.spyOn(
        itemFileUploadHandler,
        '_handleItemFileSendFailed',
      );
      spyHandleFailed.mockImplementationOnce(() => {});

      ItemAPI.requestAmazonFilePolicy.mockResolvedValue(okRes);
      ItemAPI.uploadFileToAmazonS3.mockResolvedValue(okRes);

      const result = await itemFileUploadHandler.sendItemFile(
        groupId,
        formFile,
        false,
      );

      setTimeout(() => {
        expect(spyHandleFailed).not.toBeCalled();
        expect(spyHandleSuccess).toBeCalled();
        expect(ItemAPI.requestAmazonFilePolicy).toBeCalled();
        expect(ItemAPI.uploadFileToAmazonS3).toBeCalled();
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
      const itemFile = { id: -3 } as ItemFile;
      const itemFile2 = { id: -4 } as ItemFile;
      uploadingFiles.set(1, [itemFile]);
      uploadingFiles.set(2, [itemFile2, itemFile2, itemFile2]);
      uploadingFiles.set(3, [itemFile]);
      uploadingFiles.set(5, [itemFile2]);

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
      expect(progressCaches.get(itemId)).toBeUndefined();
      expect(progressCaches.get(-4)).not.toBeUndefined();
      expect(uploadingFiles.get(1)).toBeUndefined();
      expect(uploadingFiles.get(2)).toHaveLength(3);
      expect(uploadingFiles.get(3)).toBeUndefined();
      expect(uploadingFiles.get(5)).toHaveLength(1);
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

      daoManager.getDao.mockReturnValue(itemDao);
      itemDao.put.mockImplementation(() => {});
      itemDao.update.mockImplementation(() => {});
      itemDao.delete.mockImplementation(() => {});
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
      const mockItemFileRes = new ApiResultOk(serverItemFile, 200, undefined);
      ItemAPI.putItem.mockResolvedValue(mockItemFileRes);
      const spyNewItem = jest.spyOn(itemFileUploadHandler, '_newItem');

      itemFileUploadHandler.resendFailedFile(itemWithVersion.id);

      setTimeout(() => {
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
      },         1000);
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
        done();
      },         1000);
    });

    it('should notify upload failed when the file does not exist in db', async (done: jest.DoneCallback) => {
      itemDao.get.mockResolvedValue(null);
      const spySendItemFile = jest.spyOn(
        itemFileUploadHandler,
        '_sendItemFile',
      );
      const spyUploadItem = jest.spyOn(itemFileUploadHandler, '_uploadItem');

      const itemId = 5;
      await itemFileUploadHandler.resendFailedFile(itemId);

      setTimeout(() => {
        expect(spySendItemFile).not.toHaveBeenCalled();
        expect(spyUploadItem).not.toHaveBeenCalled();
        expect(notificationCenter.emit).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          expect.anything(),
        );
        done();
      },         1000);
    });

    it('should notify upload failed when can not find the cache of the item', async (done: jest.DoneCallback) => {
      const progressCaches = new Map();
      const r: RequestHolder = { request: undefined };
      const p: Progress = { id: 1, total: 3, loaded: 5, groupId: 1 };
      const itemFileUploadStatus = {
        progress: p,
        requestHolder: r,
      } as ItemFileUploadStatus;
      progressCaches.set(5, itemFileUploadStatus);
      Object.assign(itemFileUploadHandler, {
        _progressCaches: progressCaches,
      });

      const itemId = 5;
      const item = { id: itemId, group_ids: [1], versions: [] };
      itemDao.get.mockResolvedValue(item);
      const spySendItemFile = jest.spyOn(
        itemFileUploadHandler,
        '_sendItemFile',
      );
      const spyUploadItem = jest.spyOn(itemFileUploadHandler, '_uploadItem');

      itemFileUploadHandler.resendFailedFile(itemId);
      setTimeout(() => {
        expect(spySendItemFile).not.toHaveBeenCalled();
        expect(spyUploadItem).not.toHaveBeenCalled();
        expect(notificationCenter.emit).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          expect.anything(),
        );
        expect(itemFileUploadHandler.getUploadProgress(5).loaded).toBe(-1);
        done();
      },         1000);
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

  describe('getItemsSendStatus()', () => {
    beforeEach(() => {
      itemFileUploadHandler = new ItemFileUploadHandler();
      const progressCaches: Map<number, ItemFileUploadStatus> = new Map();
      const r: RequestHolder = { request: undefined };
      progressCaches.set(-3, {
        progress: { id: -3, total: 3, loaded: 5, groupId: 1 },
        requestHolder: r,
      });
      progressCaches.set(-4, {
        progress: { id: -4, total: 3, loaded: 5, groupId: 1 },
        requestHolder: r,
      });
      progressCaches.set(-5, {
        progress: { id: -5, total: 3, loaded: -1, groupId: 1 },
        requestHolder: r,
      });
      Object.assign(itemFileUploadHandler, {
        _progressCaches: progressCaches,
      });
    });

    it('should return SUCCESS when id > 0', () => {
      const ids = [1, 2];
      const result = itemFileUploadHandler.getItemsSendStatus(ids);
      expect(result).toEqual([SENDING_STATUS.SUCCESS, SENDING_STATUS.SUCCESS]);
    });

    it('should return FAIL when id is not in progress cache', () => {
      const ids = [-999];
      const result = itemFileUploadHandler.getItemsSendStatus(ids);
      expect(result).toEqual([SENDING_STATUS.FAIL]);
    });

    it('should return FAIL when progress is -1', () => {
      const ids = [-5];
      const result = itemFileUploadHandler.getItemsSendStatus(ids);
      expect(result).toEqual([SENDING_STATUS.FAIL]);
    });

    it('should return IN_PROGRESS when id is not in progress cache and has positive progress', () => {
      const ids = [-3, -4];
      const result = itemFileUploadHandler.getItemsSendStatus(ids);
      expect(result).toEqual([
        SENDING_STATUS.INPROGRESS,
        SENDING_STATUS.INPROGRESS,
      ]);
    });
  });

  describe('cleanUploadingFiles()', () => {
    let uploadingFiles: Map<number, ItemFile[]> = null;
    beforeEach(() => {
      uploadingFiles = new Map();
      itemFileUploadHandler = new ItemFileUploadHandler();
      const itemFiles = [{ id: 1 } as ItemFile, { id: 2 } as ItemFile];
      uploadingFiles.set(1, itemFiles);
      uploadingFiles.set(2, itemFiles);
      Object.assign(itemFileUploadHandler, {
        _uploadingFiles: uploadingFiles,
      });
    });
    it('should clean recorded uploading files by groupid and itemId', () => {
      itemFileUploadHandler.cleanUploadingFiles(1, [1]);
      expect(uploadingFiles.get(1)).toHaveLength(1);
      expect(uploadingFiles.get(1)[0].id).toBe(2);
      expect(uploadingFiles.get(2)).not.toBeUndefined();
    });

    it('should clean group when no item left after clean', () => {
      itemFileUploadHandler.cleanUploadingFiles(1, [1, 2]);
      expect(uploadingFiles.get(1)).toBeUndefined();
      expect(uploadingFiles.get(2)).not.toBeUndefined();
    });
  });
});
