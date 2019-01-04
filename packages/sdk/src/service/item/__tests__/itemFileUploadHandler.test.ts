import _ from 'lodash';
import { BaseResponse, NETWORK_FAIL_TYPE } from 'foundation';

import { Progress } from '../../../models';

import { ItemFile } from '../../../module/item/entity';
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
import { isInBeta } from '../../account/clientConfig';
import { JServerError, ERROR_CODES_SERVER } from '../../../error';

jest.mock('../../account/clientConfig');
jest.mock('../../../service/item');
jest.mock('../../../service/account');
jest.mock('../../../api/glip/item');
jest.mock('../../../dao');
jest.mock('../handleData');
jest.mock('../../notificationCenter');

type ProgressCallback = (e: ProgressEventInit) => any;

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('ItemFileUploadHandler', () => {
  const itemService = new ItemService();
  const accountService = new AccountService();
  const itemDao = new ItemDao(null);
  let itemFileUploadHandler: ItemFileUploadHandler = undefined;

  function setup() {
    const userId = 2;
    const companyId = 3;
    daoManager.getDao.mockReturnValue(itemDao);
    ItemService.getInstance = jest.fn().mockReturnValue(itemService);

    itemService.handlePartialUpdate = jest.fn();

    AccountService.getInstance = jest.fn().mockReturnValue(accountService);
    accountService.getCurrentCompanyId.mockReturnValue(companyId);
    accountService.getCurrentUserId.mockReturnValue(userId);

    itemDao.put.mockImplementation(() => { });
    itemDao.update.mockImplementation(() => { });
    itemDao.delete.mockImplementation(() => { });

    notificationCenter.emitEntityReplace.mockImplementation(() => { });
    notificationCenter.emit.mockImplementation(() => { });
    notificationCenter.removeListener.mockImplementation(() => { });

    itemFileUploadHandler = new ItemFileUploadHandler();
  }

  beforeEach(() => {
    clearMocks();
  });

  describe('sendItemFile()', () => {
    const groupId = 1;
    const userId = 2;
    const companyId = 3;

    const itemDao = new ItemDao(null);
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should update local upload file record', async () => {
      jest
        .spyOn(itemFileUploadHandler, '_sendItemFile')
        .mockImplementation(() => { });
      const spy_cancelUpload = jest.spyOn(
        itemFileUploadHandler,
        'cancelUpload',
      );

      const uploadingFiles = new Map();
      const itemFiles = [
        { id: -1, name: 'name', is_new: true } as ItemFile,
        { id: -2, name: 'name', is_new: false } as ItemFile,
      ];
      uploadingFiles.set(1, itemFiles);
      uploadingFiles.set(2, itemFiles);
      Object.assign(itemFileUploadHandler, {
        _uploadingFiles: uploadingFiles,
      });

      const file = { name: 'name', type: 'ts', size: 123 } as File;
      await itemFileUploadHandler.sendItemFile(1, file, true);

      expect(uploadingFiles.get(1).length).toBe(2);
      expect(uploadingFiles.get(1)[0].id).toBe(-1);
      expect(uploadingFiles.get(1)[0].id).not.toBe(-2);
      expect(spy_cancelUpload).toBeCalledWith(-2);
    });

    it('should return null when no valid file', async () => {
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
      itemDao.get.mockResolvedValue(itemFile);
      handleData.mockResolvedValue(null);
      ItemAPI.uploadFileItem.mockImplementation(
        (files: FormData, callback: ProgressCallback) => {
          callback({ lengthComputable: false, loaded: 0, total: 100 });
          callback({ lengthComputable: false, loaded: 10, total: 100 });
          return Promise.resolve(mockStoredFileRes);
        },
      );
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
      }, 1000);
    });

    it('should go to _handleItemFileSendFailed process when upload file failed ', async (done: jest.DoneCallback) => {
      const errResponse = new ApiResultErr(new JServerError(ERROR_CODES_SERVER.GENERAL, 'error'), {
        status: 403,
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
      }, 1000);
    });

    it('should not handle failed result when the request is failed because the user canceled it.  ', async (done: jest.DoneCallback) => {
      const errRes = new ApiResultErr(new JServerError(ERROR_CODES_SERVER.GENERAL, 'error'), {
        status: 403,
        statusText: NETWORK_FAIL_TYPE.CANCELLED,
        headers: {},
      } as BaseResponse);
      ItemAPI.uploadFileItem.mockResolvedValue(errRes);
      itemService.handlePartialUpdate = jest.fn();

      jest
        .spyOn(itemFileUploadHandler, '_handleFileUploadSuccess')
        .mockImplementation(() => { });

      const file = new FormData();
      file.append('file', { name: '1.ts', type: 'ts' } as File);
      await itemFileUploadHandler.sendItemFile(groupId, file, true);

      setTimeout(() => {
        expect(ItemAPI.uploadFileItem).toBeCalled();
        expect(ItemAPI.sendFileItem).not.toBeCalled();

        expect(notificationCenter.emit).not.toBeCalled();
        expect(itemService.handlePartialUpdate).not.toBeCalled();

        done();
      }, 1000);
    });
  });

  describe('canUploadFiles()', () => {
    const oneGB = 1024 * 1024 * 1024;
    beforeEach(() => {
      clearMocks();
      setup();
    });

    function setUp_canUploadFiles() {
      const groupId = 123;
      const progressCaches = new Map();
      for (let i = 1; i < 9; i++) {
        progressCaches.set(-i, {
          itemFile: { group_ids: [groupId], versions: [{ size: 0.1 * oneGB }] },
          progress: { loaded: 10 },
        } as ItemFileUploadStatus);

        progressCaches.set(-5 * i, {
          itemFile: {
            group_ids: [groupId + 1],
            versions: [{ size: 0.1 * oneGB }],
          },
          progress: { loaded: 10 },
        } as ItemFileUploadStatus);
      }

      Object.assign(itemFileUploadHandler, {
        _progressCaches: progressCaches,
      });

      return { progressCaches, groupId };
    }

    const smallFile = { size: 1 } as File;
    const bigFile = { size: 0.5 * oneGB } as File;
    const tenFiles: File[] = [];
    for (let i = 0; i < 10; i++) {
      tenFiles.push(smallFile);
    }

    const threeSmallFile = [smallFile, smallFile, smallFile];
    const twoSmallFile = [smallFile, smallFile];
    const twoBigFile = [bigFile, bigFile];
    it.each`
      files                         | includeUnSendFiles | expectRes | comment
      ${tenFiles}                   | ${false}           | ${true}   | ${' file count === 10, size <= 1GB, not includeUnSendFiles'}
      ${tenFiles}                   | ${true}            | ${false}  | ${' file count === 10, size <= 1GB, includeUnSendFiles'}
      ${[smallFile, ...tenFiles]}   | ${false}           | ${false}  | ${'fileCount > 10, size <= 1GB, not includeUnSendFiles'}
      ${[smallFile, ...tenFiles]}   | ${true}            | ${false}  | ${'fileCount > 10, size <= 1GB, includeUnSendFiles'}
      ${twoSmallFile}               | ${false}           | ${true}   | ${' file count <= 10, size <= 1GB, not includeUnSendFiles'}
      ${twoSmallFile}               | ${true}            | ${true}   | ${' file count <= 10, size <= 1GB, includeUnSendFiles'}
      ${threeSmallFile}             | ${false}           | ${true}   | ${' file count == 10, size <= 1GB, not includeUnSendFiles'}
      ${threeSmallFile}             | ${true}            | ${false}  | ${' file count <= 10, size <= 1GB, includeUnSendFiles'}
      ${[smallFile, ...twoBigFile]} | ${false}           | ${false}  | ${' file count <= 10, size > 1GB, not includeUnSendFiles'}
      ${twoBigFile}                 | ${true}            | ${false}  | ${' file count <= 10, size > 1GB, includeUnSendFiles'}
      ${twoBigFile}                 | ${false}           | ${false}  | ${' file count <= 10, size > 1GB, not includeUnSendFiles'}
      ${[bigFile]}                  | ${true}            | ${false}  | ${' file count <= 10, size > 1GB, includeUnSendFiles'}
      ${[bigFile]}                  | ${false}           | ${false}  | ${' file count <= 10, size > 1GB, not includeUnSendFiles'}
    `(
      'should return true when file size and count matched: $comment',
      ({ files, includeUnSendFiles, expectRes }) => {
        const { groupId } = setUp_canUploadFiles();
        const result = itemFileUploadHandler.canUploadFiles(
          groupId,
          files,
          includeUnSendFiles,
        );
        expect(result).toEqual(expectRes);
      },
      );

    const oneGBFile = { size: oneGB };
    const oneGBMinusOne = { size: oneGB - 1 };
    const oneGBPlusOne = { size: oneGB + 1 };

    it.each`
      files              | includeUnSendFiles | expectRes | comment
      ${[oneGBFile]}     | ${false}           | ${true}   | ${' size === 1GB'}
      ${[oneGBMinusOne]} | ${false}           | ${true}   | ${' size < 1GB'}
      ${[oneGBPlusOne]}  | ${false}           | ${false}  | ${' size > 1GB'}
    `('border test: $comment', ({ files, includeUnSendFiles, expectRes }) => {
        const result = itemFileUploadHandler.canUploadFiles(
          1,
          files,
          includeUnSendFiles,
        );
        expect(result).toEqual(expectRes);
      });
  });

  describe('getUpdateItemVersion()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    function setup_getUpdateItemVersion() {
      const realItemFile = {
        created_at: 10,
        id: 10,
        group_ids: [1],
        name: '10',
        versions: [{ id: 1 }, { id: 2 }],
      };
      const pseudoItemFile = {
        id: -10,
        group_ids: [1],
        name: '10',
        versions: [{ id: 1 }],
      };
      return { realItemFile, pseudoItemFile };
    }

    it('should just return number of versions in the itemFile when its id > 0', async () => {
      const { realItemFile } = setup_getUpdateItemVersion();
      const result = await itemFileUploadHandler.getUpdateItemVersion(
        realItemFile as ItemFile,
      );
      expect(result).toBe(realItemFile.versions.length);
    });

    it('should return version number base on the history item in the group', async () => {
      const { pseudoItemFile, realItemFile } = setup_getUpdateItemVersion();

      const realItemFile2 = _.cloneDeep(realItemFile);
      realItemFile2.created_at = 9;
      itemDao.getExistGroupFilesByName.mockResolvedValue([
        realItemFile,
        realItemFile2,
      ]);
      const result = await itemFileUploadHandler.getUpdateItemVersion(
        pseudoItemFile as ItemFile,
      );
      expect(result).toBe(realItemFile.versions.length + 1);
    });

    it('should return 0 when can not find history item in the group', async () => {
      const { pseudoItemFile } = setup_getUpdateItemVersion();
      itemDao.getExistGroupFilesByName.mockResolvedValue([]);
      const result = await itemFileUploadHandler.getUpdateItemVersion(
        pseudoItemFile as ItemFile,
      );
      expect(result).toBe(0);
    });
  });

  describe('sendItemData()', () => {
    function sendItemData_setUp() {
      const validStoredFile = {
        _id: 123,
        creator_id: 2588675,
        last_modified: 1542274244897,
        download_url: 'url/123.pdf',
        url: 'url/123',
        stored_file_id: 5701644,
        size: 1111,
      };

      const invalidStoredFile = {
        _id: 123,
        creator_id: 2588675,
        last_modified: 1542274244897,
        download_url: '',
        url: '',
        stored_file_id: 5701644,
        size: 1111,
      };

      const progressCaches = new Map();
      const fileItem = {
        id: -3,
        is_new: true,
        versions: [validStoredFile],
      } as ItemFile;

      const r: RequestHolder = { request: undefined };
      const p: Progress = { id: -3, total: 3, loaded: 5, groupId: 1 };
      const file = {
        name: '1.ts',
        type: 'ts',
        size: 123123,
      } as File;
      const itemFileUploadStatus = {
        file,
        progress: p,
        requestHolder: r,
        itemFile: fileItem,
      } as ItemFileUploadStatus;
      progressCaches.set(-3, itemFileUploadStatus);
      const itemFileUploadStatus2 = _.cloneDeep(itemFileUploadStatus);
      itemFileUploadStatus2.itemFile.id = -4;
      itemFileUploadStatus2.itemFile.versions = [invalidStoredFile];
      progressCaches.set(-4, itemFileUploadStatus2);

      const itemFileUploadStatus3 = _.cloneDeep(itemFileUploadStatus);
      itemFileUploadStatus3.itemFile.id = -5;
      itemFileUploadStatus3.itemFile.versions = [invalidStoredFile];
      progressCaches.set(-5, itemFileUploadStatus3);

      const groupId = 3;

      const okRes = new ApiResultOk({ id: 10 }, {
        status: 200,
        headers: {},
      } as BaseResponse);

      const errRes = new ApiResultErr<ItemFile>(new JServerError(ERROR_CODES_SERVER.GENERAL, 'error'), {
        status: 403,
        headers: {},
      } as BaseResponse);

      return { progressCaches, groupId, validStoredFile, errRes, okRes };
    }

    beforeEach(() => {
      clearMocks();
      setup();
      isInBeta.mockReturnValue(false);
    });

    it('should just send item to server when all file has beed uploaded and has stored file', async (done: jest.DoneCallback) => {
      const { progressCaches, groupId, okRes } = sendItemData_setUp();
      Object.assign(itemFileUploadHandler, {
        _progressCaches: progressCaches,
      });

      const spy_waitUntilAllItemCreated = jest.spyOn(
        itemFileUploadHandler,
        '_waitUntilAllItemCreated',
      );

      ItemAPI.putItem.mockResolvedValue(okRes);
      ItemAPI.sendFileItem.mockResolvedValue(okRes);

      itemDao.getExistGroupFilesByName.mockResolvedValue([]);

      await itemFileUploadHandler.sendItemData(groupId, [-3]);

      setTimeout(() => {
        expect(ItemAPI.putItem).not.toBeCalled();
        expect(ItemAPI.sendFileItem).toBeCalled();
        expect(notificationCenter.emit).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          {
            status: SENDING_STATUS.SUCCESS,
            preInsertId: -3,
            updatedId: 10,
          },
        );
        expect(progressCaches.get(-3)).toBeUndefined;
        expect(spy_waitUntilAllItemCreated).not.toBeCalled();
        expect(notificationCenter.emitEntityReplace).toBeCalled();
        done();
      });
    });

    it('should update item when user want to update the file item', async (done: jest.DoneCallback) => {
      const { progressCaches, groupId, okRes } = sendItemData_setUp();
      progressCaches.get(-3).itemFile.is_new = false;
      Object.assign(itemFileUploadHandler, {
        _progressCaches: progressCaches,
      });

      const spy_handleItemUploadSuccess = jest.spyOn(
        itemFileUploadHandler,
        '_handleItemUploadSuccess',
      );

      ItemAPI.putItem.mockResolvedValue(okRes);
      ItemAPI.sendFileItem.mockResolvedValue(okRes);
      itemDao.getExistGroupFilesByName.mockResolvedValue([{ id: 99 }]);

      await itemFileUploadHandler.sendItemData(groupId, [-3]);

      setTimeout(() => {
        expect(ItemAPI.putItem).toBeCalled();
        expect(ItemAPI.sendFileItem).not.toBeCalled();
        expect(spy_handleItemUploadSuccess).toBeCalled();
        done();
      });
    });

    it('should send failed notification when send item failed', async (done: jest.DoneCallback) => {
      const { progressCaches, groupId, errRes } = sendItemData_setUp();
      Object.assign(itemFileUploadHandler, {
        _progressCaches: progressCaches,
      });

      ItemAPI.sendFileItem.mockResolvedValue(errRes);
      itemDao.getExistGroupFilesByName.mockResolvedValue([]);

      await itemFileUploadHandler.sendItemData(groupId, [-3]);

      setTimeout(() => {
        expect(progressCaches.get(-3).progress.loaded).toBe(-1);
        expect(notificationCenter.emit).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          {
            status: SENDING_STATUS.FAIL,
            preInsertId: -3,
            updatedId: -3,
          },
        );
        expect(ItemAPI.putItem).not.toBeCalled();
        expect(ItemAPI.sendFileItem).toBeCalled();
        done();
      });
    });

    it('should send item data to server until all file has beed sent to server ', async (done: jest.DoneCallback) => {
      const { progressCaches, groupId, validStoredFile } = sendItemData_setUp();
      Object.assign(itemFileUploadHandler, {
        _progressCaches: progressCaches,
      });

      notificationCenter.on.mockImplementation(
        (event: string | string[], listener: Listener) => {
          listener({
            status: SENDING_STATUS.INPROGRESS,
            preInsertId: -6,
            updatedId: -6,
          });

          progressCaches.get(-5).itemFile.versions = [validStoredFile];
          listener({
            status: SENDING_STATUS.FAIL,
            preInsertId: -5,
            updatedId: -5,
          });

          progressCaches.get(-4).itemFile.versions = [validStoredFile];
          listener({
            status: SENDING_STATUS.INPROGRESS,
            preInsertId: -4,
            updatedId: -4,
          });
        },
      );

      const spy_uploadItem = jest.spyOn(itemFileUploadHandler, '_uploadItem');

      await itemFileUploadHandler.sendItemData(groupId, [-4, -5]);

      setTimeout(() => {
        expect(progressCaches.get(-3)).toBeUndefined;
        expect(notificationCenter.on).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          expect.anything(),
        );
        expect(notificationCenter.removeListener).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          expect.anything(),
        );
        expect(spy_uploadItem).toBeCalled();
        done();
      });
    });
  });

  describe('uploadFileToAmazonS3', () => {
    beforeEach(() => {
      clearMocks();
      isInBeta.mockReturnValue(true);
      setup();
    });

    function uploadFileToAmazonS3_setUp() {
      const file = {
        name: '1.ts',
        type: 'ts',
        size: 123123,
      } as File;

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

      const errRes = new ApiResultErr(new JServerError(ERROR_CODES_SERVER.GENERAL, 'error'), {
        status: 403,
        headers: {},
      } as BaseResponse);

      const groupId = 123123;

      return {
        groupId,
        file,
        okRes,
        errRes,
      };
    }

    it('should go to handle send file failed when request amazon s3 policy failed', async (done: jest.DoneCallback) => {
      expect.assertions(3);
      const { groupId, errRes, okRes, file } = uploadFileToAmazonS3_setUp();

      const spyHandleFailed = jest.spyOn(
        itemFileUploadHandler,
        '_handleItemFileSendFailed',
      );
      spyHandleFailed.mockImplementation(() => { });

      ItemAPI.requestAmazonFilePolicy.mockResolvedValue(errRes);
      ItemAPI.uploadFileToAmazonS3.mockResolvedValue(okRes);

      await itemFileUploadHandler.sendItemFile(groupId, file, false);
      setTimeout(() => {
        expect(ItemAPI.requestAmazonFilePolicy).toBeCalled();
        expect(ItemAPI.uploadFileToAmazonS3).not.toBeCalled();
        expect(spyHandleFailed).toHaveBeenCalled();
        done();
      });
    });

    it('should notify send file failed when upload file to amazon s3 failed', async (done: jest.DoneCallback) => {
      const { groupId, errRes, okRes, file } = uploadFileToAmazonS3_setUp();

      const spyHandleSuccess = jest.spyOn(
        itemFileUploadHandler,
        '_handleFileUploadSuccess',
      );
      spyHandleSuccess.mockImplementation(() => { });

      const spyHandleFailed = jest.spyOn(
        itemFileUploadHandler,
        '_handleItemFileSendFailed',
      );
      spyHandleFailed.mockImplementation(() => { });

      ItemAPI.requestAmazonFilePolicy.mockResolvedValue(okRes);
      ItemAPI.uploadFileToAmazonS3.mockResolvedValue(errRes);

      await itemFileUploadHandler.sendItemFile(groupId, file, false);
      setTimeout(() => {
        expect(ItemAPI.requestAmazonFilePolicy).toBeCalled();
        expect(ItemAPI.uploadFileToAmazonS3).toBeCalled();
        expect(spyHandleSuccess).not.toBeCalled();
        expect(spyHandleFailed).toBeCalled();
        done();
      });
    });

    it('should handle send file success when request policy and upload are both success', async (done: jest.DoneCallback) => {
      const { groupId, okRes, file } = uploadFileToAmazonS3_setUp();

      const spyHandleSuccess = jest.spyOn(
        itemFileUploadHandler,
        '_handleFileUploadSuccess',
      );
      spyHandleSuccess.mockImplementationOnce(() => { });

      const spyHandleFailed = jest.spyOn(
        itemFileUploadHandler,
        '_handleItemFileSendFailed',
      );
      spyHandleFailed.mockImplementationOnce(() => { });

      ItemAPI.requestAmazonFilePolicy.mockResolvedValue(okRes);
      ItemAPI.uploadFileToAmazonS3.mockResolvedValue(okRes);

      await itemFileUploadHandler.sendItemFile(groupId, file, false);

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
      clearMocks();
      setup();

      ItemAPI.cancelUploadRequest.mockImplementation(() => { });

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
    beforeEach(() => {
      clearMocks();
      setup();
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
      }, 1000);
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
      spySendItemFile.mockImplementation(() => { });
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
      }, 1000);
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
      }, 1000);
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
      }, 1000);
    });
  });

  describe('getUploadItems()', () => {
    let uploadingFiles: Map<number, ItemFile[]> = null;
    beforeEach(() => {
      clearMocks();
      setup();

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
      clearMocks();
      setup();

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
      clearMocks();
      setup();

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

  describe('canResendFailedFile', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should return true when has valid store file', async () => {
      itemDao.get.mockResolvedValue({
        id: -1,
        versions: [
          {
            _id: 123,
            creator_id: 2588675,
            last_modified: 1542274244897,
            download_url: 'url/123.pdf',
            url: 'url/123',
            stored_file_id: 5701644,
            size: 1111,
          },
        ],
      });
      expect(await itemFileUploadHandler.canResendFailedFile(-1)).toBeTruthy();
      expect(itemDao.get).toBeCalledWith(-1);
    });

    it('should return true input id > 0', async () => {
      expect(await itemFileUploadHandler.canResendFailedFile(1)).toBeTruthy();
      expect(itemDao.get).not.toBeCalled();
    });

    it('should return false when can not find item in db', async () => {
      itemDao.get.mockResolvedValue(null);
      expect(await itemFileUploadHandler.canResendFailedFile(-1)).toBeFalsy();
      expect(itemDao.get).toBeCalledWith(-1);
    });

    it('should return true when has valid file', async () => {
      const progressCaches = new Map();
      Object.assign(itemFileUploadHandler, {
        _progressCaches: progressCaches,
      });

      progressCaches.set(-1, {
        itemFile: { group_ids: [1], versions: [{ size: 1 }] },
        progress: { loaded: 10 },
        file: { size: 1, name: 'name' } as File,
      } as ItemFileUploadStatus);

      itemDao.get.mockResolvedValue({
        id: -1,
        group_ids: [1],
        versions: [
          {
            _id: 123,
            download_url: '',
            url: '',
          },
        ],
      });
      expect(await itemFileUploadHandler.canResendFailedFile(-1)).toBeTruthy();
      expect(itemDao.get).toBeCalledWith(-1);
    });

    it('should return false when the cached file has no size', async () => {
      const progressCaches = new Map();
      Object.assign(itemFileUploadHandler, {
        _progressCaches: progressCaches,
      });

      progressCaches.set(-1, {
        itemFile: { group_ids: [1], versions: [{ size: 1 }] },
        progress: { loaded: 10 },
        file: { size: 0, name: 'name' } as File,
      } as ItemFileUploadStatus);

      itemDao.get.mockResolvedValue({
        id: -1,
        group_ids: [1],
        versions: [
          {
            _id: 123,
            download_url: '',
            url: '',
          },
        ],
      });
      expect(await itemFileUploadHandler.canResendFailedFile(-1)).toBeFalsy();
      expect(itemDao.get).toBeCalledWith(-1);
    });

    it('should return false when can not find file cache', async () => {
      const progressCaches = new Map();
      Object.assign(itemFileUploadHandler, {
        _progressCaches: progressCaches,
      });
      itemDao.get.mockResolvedValue({
        id: -1,
        group_ids: [1],
        versions: [
          {
            _id: 123,
            download_url: '',
            url: '',
          },
        ],
      });
      expect(await itemFileUploadHandler.canResendFailedFile(-1)).toBeFalsy();
      expect(itemDao.get).toBeCalledWith(-1);
    });
  });

  describe('cleanUploadingFiles()', () => {
    let uploadingFiles: Map<number, ItemFile[]> = null;
    beforeEach(() => {
      clearMocks();
      setup();

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
