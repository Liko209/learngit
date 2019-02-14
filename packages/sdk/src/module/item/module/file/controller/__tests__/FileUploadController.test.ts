/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-04 08:52:26
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../../../../__tests__/types.d.ts" />
import _ from 'lodash';
import { BaseResponse, NETWORK_FAIL_TYPE } from 'foundation';
import { ItemFile } from '../../../../../../module/item/entity';
import { daoManager } from '../../../../../../dao';
import { ItemDao } from '../../../../dao';

import ItemAPI from '../../../../../../api/glip/item';
import { ApiResultOk, ApiResultErr } from '../../../../../../api/ApiResult';
import notificationCenter from '../../../../../../service/notificationCenter';
import { RequestHolder } from '../../../../../../api/requestHolder';
import { Progress, PROGRESS_STATUS } from '../../../../../progress';
import { ENTITY, SERVICE } from '../../../../../../service/eventKey';
import { UserConfig } from '../../../../../../service/account/UserConfig';
import { isInBeta } from '../../../../../../service/account/clientConfig';
import { PartialModifyController } from '../../../../../../framework/controller/impl/PartialModifyController';
import { EntitySourceController } from '../../../../../../framework/controller/impl/EntitySourceController';
import { RequestController } from '../../../../../../framework/controller/impl/RequestController';
import {
  FileUploadController,
  ItemFileUploadStatus,
} from '../FileUploadController';
import { ItemService } from '../../../../service/ItemService';
import {
  JServerError,
  ERROR_CODES_SERVER,
  JSdkError,
  ERROR_CODES_SDK,
} from '../../../../../../error';

jest.mock('../../../../service/ItemService');
jest.mock(
  '../../../../../../framework/controller/impl/PartialModifyController',
);
jest.mock('../../../../../../framework/controller/impl/EntitySourceController');
jest.mock('../../../../../../framework/controller/impl/RequestController');
jest.mock('../../../../../../service/account/clientConfig');
jest.mock('../../../../../../service/account/UserConfig');
jest.mock('../../../../../../api/glip/item');
jest.mock('../../../../dao');
jest.mock('../../../../../../dao');
jest.mock('../../../../../../service/notificationCenter');

type ProgressCallback = (e: ProgressEventInit) => any;

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('fileUploadController', () => {
  const itemService = new ItemService();
  const itemDao = new ItemDao(null);
  let fileUploadController: FileUploadController;
  const partialModifyController = new PartialModifyController(null);
  const fileRequestController = new RequestController(null);
  const entitySourceController = new EntitySourceController(null, null, null);

  function setup() {
    const userId = 2;
    const companyId = 3;
    daoManager.getDao.mockReturnValue(itemDao);

    UserConfig.getCurrentCompanyId.mockReturnValue(companyId);
    UserConfig.getCurrentUserId.mockReturnValue(userId);

    itemService.createItem.mockImplementation(() => {});
    itemService.updateItem.mockImplementation(() => {});
    itemService.deleteItem.mockImplementation(() => {});

    notificationCenter.emitEntityReplace.mockImplementation(() => {});
    notificationCenter.emit.mockImplementation(() => {});
    notificationCenter.removeListener.mockImplementation(() => {});

    fileUploadController = new FileUploadController(
      itemService,
      partialModifyController,
      fileRequestController,
      entitySourceController,
    );
    partialModifyController.updatePartially = jest.fn();
  }

  beforeEach(() => {
    clearMocks();
  });

  describe('deleteFileCache', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should delete the cached item file status', () => {
      const groupId = 1;
      const progressCaches = new Map();
      progressCaches.set(-1, {
        itemFile: { group_ids: [groupId], versions: [{ size: 0.1 * 1 }] },
        progress: { rate: { loaded: 10 } },
      } as ItemFileUploadStatus);
      Object.assign(fileUploadController, {
        _progressCaches: progressCaches,
      });

      expect(progressCaches.get(-1)).not.toBeUndefined();
      fileUploadController.deleteFileCache(-1);
      expect(progressCaches.get(-1)).toBeUndefined();
    });
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
        .spyOn(fileUploadController, '_sendItemFile')
        .mockImplementation(() => {});
      const spy_cancelUpload = jest.spyOn(fileUploadController, 'cancelUpload');

      const uploadingFiles = new Map();
      const itemFiles = [
        { id: -1, name: 'name', is_new: true } as ItemFile,
        { id: -2, name: 'name', is_new: false } as ItemFile,
      ];
      uploadingFiles.set(1, itemFiles);
      uploadingFiles.set(2, itemFiles);
      Object.assign(fileUploadController, {
        _uploadingFiles: uploadingFiles,
      });

      const file = { name: 'name', type: 'ts', size: 123 } as File;
      await fileUploadController.sendItemFile(1, file, true);

      expect(uploadingFiles.get(1).length).toBe(2);
      expect(uploadingFiles.get(1)[0].id).toBe(-1);
      expect(uploadingFiles.get(1)[0].id).not.toBe(-2);
      expect(spy_cancelUpload).toBeCalledWith(-2);
    });

    it('should return null when no valid file', async () => {
      const file = undefined as File;
      const result = await fileUploadController.sendItemFile(
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
      ItemAPI.uploadFileItem.mockImplementation(
        (files: FormData, callback: ProgressCallback) => {
          callback({ lengthComputable: false, loaded: 0, total: 100 });
          callback({ lengthComputable: false, loaded: 10, total: 100 });
          return Promise.resolve(mockStoredFileRes);
        },
      );

      const file = { name: '1.ts', type: 'image/ts', size: 123 } as File;
      const res = (await fileUploadController.sendItemFile(
        groupId,
        file,
        false,
      )) as ItemFile;

      expect(res.id).toBeLessThan(0);
      expect(res.creator_id).toBe(userId);
      expect(res.group_ids).toEqual([groupId]);
      expect(res.deactivated).toBeFalsy;
      expect(res.company_id).toBe(companyId);
      expect(res.type_id).toBe(10);
      expect(res.type).toBe('ts');

      setTimeout(() => {
        expect(ItemAPI.putItem).not.toHaveBeenCalled();
        expect(ItemAPI.sendFileItem).not.toBeCalledTimes(1);
        expect(itemService.createItem).toBeCalledTimes(1);
        expect(notificationCenter.emitEntityUpdate).toBeCalledWith(
          ENTITY.PROGRESS,
          [{ id: expect.any(Number), rate: { loaded: 10, total: 100 } }],
        );
        expect(partialModifyController.updatePartially).toBeCalledTimes(1);
        expect(notificationCenter.emit).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          {
            status: PROGRESS_STATUS.INPROGRESS,
            preInsertId: expect.any(Number),
            updatedId: expect.any(Number),
          },
        );
        done();
      },         1000);
    });

    it('should go to _handleItemFileSendFailed process when upload file failed ', async (done: jest.DoneCallback) => {
      const errResponse = new ApiResultErr(
        new JServerError(ERROR_CODES_SERVER.GENERAL, 'error'),
        {
          status: 403,
          headers: {},
        } as BaseResponse,
      );

      itemDao.get.mockResolvedValue(itemFile);
      ItemAPI.uploadFileItem.mockResolvedValue(errResponse);

      // fileService.handlePartialUpdate = jest.fn();

      const file = new FormData();
      file.append('file', { name: '1.ts', type: 'ts' } as File);
      await fileUploadController.sendItemFile(groupId, file, false);
      const fileItem = fileUploadController.getUploadItems(groupId)[0];
      setTimeout(() => {
        expect(ItemAPI.uploadFileItem).toBeCalled();
        expect(ItemAPI.sendFileItem).not.toBeCalled();
        expect(notificationCenter.emit).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          expect.anything(),
        );
        expect(fileUploadController.getItemsSendStatus([fileItem.id])).toEqual([
          PROGRESS_STATUS.FAIL,
        ]);
        expect(
          fileUploadController.getUploadProgress(fileItem.id).rate.loaded,
        ).toBe(-1);
        done();
      },         1000);
    });

    it('should not handle failed result when the request is failed because the user canceled it.  ', async (done: jest.DoneCallback) => {
      const errRes = new ApiResultErr(
        new JServerError(ERROR_CODES_SERVER.GENERAL, 'error'),
        {
          status: 403,
          statusText: NETWORK_FAIL_TYPE.CANCELLED,
          headers: {},
        } as BaseResponse,
      );
      ItemAPI.uploadFileItem.mockResolvedValue(errRes);
      jest
        .spyOn(fileUploadController, '_handleFileUploadSuccess')
        .mockImplementation(() => {});

      const cancel = {
        has: jest.fn().mockReturnValue(true),
      };

      Object.assign(fileUploadController, {
        _canceledUploadFileIds: cancel,
      });

      const file = { name: '1.ts', type: 'ts' } as File;
      await fileUploadController.sendItemFile(groupId, file, true);

      setTimeout(() => {
        expect(ItemAPI.uploadFileItem).toBeCalled();
        expect(fileRequestController.post).not.toBeCalled();

        expect(notificationCenter.emit).not.toBeCalled();
        expect(partialModifyController.updatePartially).not.toBeCalled();

        done();
      },         1000);
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
          progress: { rate: { loaded: 10 } },
        } as ItemFileUploadStatus);

        progressCaches.set(-5 * i, {
          itemFile: {
            group_ids: [groupId + 1],
            versions: [{ size: 0.1 * oneGB }],
          },
          progress: { rate: { loaded: 10 } },
        } as ItemFileUploadStatus);
      }

      Object.assign(fileUploadController, {
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
        const result = fileUploadController.canUploadFiles(
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
      const result = fileUploadController.canUploadFiles(
        1,
        files,
        includeUnSendFiles,
      );
      expect(result).toEqual(expectRes);
    });
  });

  describe('getFileVersion()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    function setup_getFileVersion() {
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
      const { realItemFile } = setup_getFileVersion();
      const result = await fileUploadController.getFileVersion(
        realItemFile as ItemFile,
      );
      expect(result).toBe(realItemFile.versions.length);
    });

    it('should return version number base on the history item in the group', async () => {
      const { pseudoItemFile, realItemFile } = setup_getFileVersion();

      const realItemFile2 = _.cloneDeep(realItemFile);
      realItemFile2.created_at = 9;
      itemDao.getExistGroupFilesByName.mockResolvedValue([
        realItemFile,
        realItemFile2,
      ]);
      const result = await fileUploadController.getFileVersion(
        pseudoItemFile as ItemFile,
      );
      expect(result).toBe(realItemFile.versions.length + 1);
    });

    it('should return 0 when can not find history item in the group', async () => {
      const { pseudoItemFile } = setup_getFileVersion();
      itemDao.getExistGroupFilesByName.mockResolvedValue([]);
      const result = await fileUploadController.getFileVersion(
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
      const p: Progress = { id: -3, rate: { total: 3, loaded: 5 } };
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

      const errRes = new ApiResultErr<ItemFile>(
        new JServerError(ERROR_CODES_SERVER.GENERAL, 'error'),
        {
          status: 403,
          headers: {},
        } as BaseResponse,
      );

      return {
        progressCaches,
        groupId,
        validStoredFile,
        errRes,
        okRes,
        fileItem,
      };
    }

    beforeEach(() => {
      clearMocks();
      setup();
      isInBeta.mockReturnValue(false);
    });

    it('should just send item to server when all file has beed uploaded and has stored file', async (done: jest.DoneCallback) => {
      const { progressCaches, groupId, fileItem } = sendItemData_setUp();
      Object.assign(fileUploadController, {
        _progressCaches: progressCaches,
      });

      const spy_waitUntilAllItemCreated = jest.spyOn(
        fileUploadController,
        '_waitUntilAllItemCreated',
      );

      const responseItem = { id: 10 };
      fileRequestController.put.mockResolvedValue(responseItem);
      fileRequestController.post.mockResolvedValue(responseItem);

      itemDao.getExistGroupFilesByName.mockResolvedValue([]);

      await fileUploadController.sendItemData(groupId, [-3]);

      setTimeout(() => {
        expect(fileRequestController.put).not.toBeCalled();
        expect(fileRequestController.post).toBeCalled();
        expect(notificationCenter.emit).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          {
            status: PROGRESS_STATUS.SUCCESS,
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
      Object.assign(fileUploadController, {
        _progressCaches: progressCaches,
      });

      const spy_handleItemUploadSuccess = jest.spyOn(
        fileUploadController,
        '_handleItemUploadSuccess',
      );

      const responseItem = { id: 10 };
      fileRequestController.put.mockResolvedValue(responseItem);
      fileRequestController.post.mockResolvedValue(responseItem);

      itemDao.getExistGroupFilesByName.mockResolvedValue([{ id: 99 }]);

      await fileUploadController.sendItemData(groupId, [-3]);

      setTimeout(() => {
        expect(fileRequestController.put).toBeCalled();
        expect(fileRequestController.post).not.toBeCalled();
        expect(spy_handleItemUploadSuccess).toBeCalled();
        done();
      });
    });

    it('should send failed notification when send item failed', async (done: jest.DoneCallback) => {
      const { progressCaches, groupId } = sendItemData_setUp();
      Object.assign(fileUploadController, {
        _progressCaches: progressCaches,
      });

      fileRequestController.post.mockImplementation(() => {
        throw new JSdkError(ERROR_CODES_SDK.GENERAL, 'error');
      });

      itemDao.getExistGroupFilesByName.mockResolvedValue([]);

      await fileUploadController.sendItemData(groupId, [-3]);

      setTimeout(() => {
        expect(progressCaches.get(-3).progress.rate.loaded).toBe(-1);
        expect(notificationCenter.emit).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          {
            status: PROGRESS_STATUS.FAIL,
            preInsertId: -3,
            updatedId: -3,
          },
        );
        expect(fileRequestController.put).not.toBeCalled();
        expect(fileRequestController.post).toBeCalled();
        done();
      });
    });

    it('should send item data to server and remove listener until file has beed sent to server ', async (done: jest.DoneCallback) => {
      const { progressCaches, groupId, validStoredFile } = sendItemData_setUp();
      Object.assign(fileUploadController, {
        _progressCaches: progressCaches,
      });

      notificationCenter.on.mockImplementation(
        (event: string | string[], listener: Listener) => {
          listener({
            status: PROGRESS_STATUS.INPROGRESS,
            preInsertId: -6,
            updatedId: -6,
          });

          progressCaches.get(-5).itemFile.versions = [validStoredFile];
          listener({
            status: PROGRESS_STATUS.FAIL,
            preInsertId: -5,
            updatedId: -5,
          });

          progressCaches.get(-4).itemFile.versions = [validStoredFile];
          listener({
            status: PROGRESS_STATUS.INPROGRESS,
            preInsertId: -4,
            updatedId: -4,
          });
        },
      );

      const spy_uploadItem = jest.spyOn(fileUploadController, '_uploadItem');
      spy_uploadItem.mockImplementation(() => {});
      await fileUploadController.sendItemData(groupId, [-4, -5]);

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

      const errRes = new ApiResultErr(
        new JServerError(ERROR_CODES_SERVER.GENERAL, 'error'),
        {
          status: 403,
          headers: {},
        } as BaseResponse,
      );

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
        fileUploadController,
        '_handleItemFileSendFailed',
      );
      spyHandleFailed.mockImplementation(() => {});

      ItemAPI.requestAmazonFilePolicy.mockResolvedValue(errRes);
      ItemAPI.uploadFileToAmazonS3.mockResolvedValue(okRes);

      await fileUploadController.sendItemFile(groupId, file, false);
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
        fileUploadController,
        '_handleFileUploadSuccess',
      );
      spyHandleSuccess.mockImplementation(() => {});

      const spyHandleFailed = jest.spyOn(
        fileUploadController,
        '_handleItemFileSendFailed',
      );
      spyHandleFailed.mockImplementation(() => {});

      ItemAPI.requestAmazonFilePolicy.mockResolvedValue(okRes);
      ItemAPI.uploadFileToAmazonS3.mockResolvedValue(errRes);

      await fileUploadController.sendItemFile(groupId, file, false);
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
        fileUploadController,
        '_handleFileUploadSuccess',
      );
      spyHandleSuccess.mockImplementationOnce(() => {});

      const spyHandleFailed = jest.spyOn(
        fileUploadController,
        '_handleItemFileSendFailed',
      );
      spyHandleFailed.mockImplementationOnce(() => {});

      ItemAPI.requestAmazonFilePolicy.mockResolvedValue(okRes);
      ItemAPI.uploadFileToAmazonS3.mockResolvedValue(okRes);

      await fileUploadController.sendItemFile(groupId, file, false);

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

      ItemAPI.cancelUploadRequest.mockImplementation(() => {});

      progressCaches = new Map();
      const r: RequestHolder = { request: undefined };
      const p: Progress = { id: -3, rate: { total: 3, loaded: 5 } };
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

      Object.assign(fileUploadController, {
        _progressCaches: progressCaches,
        _uploadingFiles: uploadingFiles,
      });
    });

    it('should not call cancel api and update when item id is not in progress', async () => {
      const itemId = 10;
      await fileUploadController.cancelUpload(itemId);
      expect(ItemAPI.cancelUploadRequest).not.toBeCalled();
      expect(notificationCenter.emitEntityDelete).toBeCalledWith(
        ENTITY.ITEM,
        expect.anything(),
      );
      expect(itemService.deleteItem).toBeCalledTimes(1);
      expect(uploadingFiles.get(1)).toHaveLength(1);
      expect(uploadingFiles.get(2)).toHaveLength(3);
      expect(progressCaches.get(-3)).not.toBeUndefined();
      expect(progressCaches.get(-4)).not.toBeUndefined();
    });

    it('should delete item and send notification', async () => {
      const itemId = -3;
      await fileUploadController.cancelUpload(itemId);
      expect(itemService.deleteItem).toBeCalledTimes(1);
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

    const itemWithVersion = {
      id: -10,
      group_ids: [1],
      is_new: false,
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

    const itemWithOutVersion = {
      id: -3,
      group_ids: [1],
      is_new: true,
      name: 'name',
      versions: [],
    };

    it('should just upload item when file has beed send successfully', async (done: jest.DoneCallback) => {
      const existItem = { id: 11, versions: [] };
      itemDao.getExistGroupFilesByName.mockResolvedValue([existItem]);
      itemDao.get.mockResolvedValue(itemWithVersion);
      const serverItemFile = {
        id: 11,
        versions: itemWithVersion.versions,
      };
      const mockItemFileRes = new ApiResultOk(serverItemFile, 200, undefined);
      ItemAPI.putItem.mockResolvedValue(mockItemFileRes);
      fileRequestController.put.mockResolvedValue(serverItemFile);
      const spyNewItem = jest.spyOn(fileUploadController, '_newItem');

      fileUploadController.resendFailedFile(itemWithVersion.id);

      setTimeout(() => {
        expect(itemDao.getExistGroupFilesByName).toBeCalledWith(
          itemWithVersion.group_ids[0],
          itemWithVersion.name,
          true,
        );
        expect(itemService.deleteItem).toBeCalledWith(itemWithVersion.id);
        expect(itemService.updateItem).toBeCalledWith(serverItemFile);
        expect(fileRequestController.put).toBeCalledTimes(1);
        expect(spyNewItem).not.toBeCalled();
        expect(notificationCenter.emitEntityReplace).toBeCalled();
        done();
      },         1000);
    });

    it('should upload file again when file has not beed sent', async (done: jest.DoneCallback) => {
      itemDao.get.mockResolvedValue(itemWithOutVersion);
      const spySendItemFile = jest.spyOn(fileUploadController, '_sendItemFile');
      spySendItemFile.mockImplementation(() => {});
      const spyUploadItem = jest.spyOn(fileUploadController, '_uploadItem');
      const spyHandleFileItemSendFailed = jest.spyOn(
        fileUploadController,
        '_handleItemFileSendFailed',
      );
      const progressCaches: Map<number, ItemFileUploadStatus> = new Map();
      const r: RequestHolder = { request: undefined };
      const p: Progress = { id: -3, rate: { total: 3, loaded: 5 } };
      const f = new FormData();
      const itemFileUploadStatus = {
        progress: p,
        requestHolder: r,
        file: f,
      } as ItemFileUploadStatus;
      progressCaches.set(-3, itemFileUploadStatus);
      progressCaches.set(-4, itemFileUploadStatus);
      Object.assign(fileUploadController, {
        _progressCaches: progressCaches,
      });

      fileUploadController.resendFailedFile(itemWithOutVersion.id);
      setTimeout(() => {
        expect(spyUploadItem).not.toHaveBeenCalled();
        expect(spyHandleFileItemSendFailed).not.toBeCalled();
        expect(spySendItemFile).toBeCalled();
        done();
      },         1000);
    });

    it('should notify upload failed when the file does not exist in db', async (done: jest.DoneCallback) => {
      itemDao.get.mockResolvedValue(null);
      const spySendItemFile = jest.spyOn(fileUploadController, '_sendItemFile');
      const spyUploadItem = jest.spyOn(fileUploadController, '_uploadItem');

      const itemId = 5;
      await fileUploadController.resendFailedFile(itemId);

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
      const p: Progress = { id: 1, rate: { total: 3, loaded: 5 } };
      const itemFileUploadStatus = {
        progress: p,
        requestHolder: r,
      } as ItemFileUploadStatus;
      progressCaches.set(5, itemFileUploadStatus);
      Object.assign(fileUploadController, {
        _progressCaches: progressCaches,
      });

      const itemId = 5;
      const item = { id: itemId, group_ids: [1], versions: [] };
      itemDao.get.mockResolvedValue(item);
      const spySendItemFile = jest.spyOn(fileUploadController, '_sendItemFile');
      const spyUploadItem = jest.spyOn(fileUploadController, '_uploadItem');

      fileUploadController.resendFailedFile(itemId);
      setTimeout(() => {
        expect(spySendItemFile).not.toHaveBeenCalled();
        expect(spyUploadItem).not.toHaveBeenCalled();
        expect(notificationCenter.emit).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          expect.anything(),
        );
        expect(fileUploadController.getUploadProgress(5).rate.loaded).toBe(-1);
        done();
      },         1000);
    });
  });

  describe('getUploadItems()', () => {
    let uploadingFiles: Map<number, ItemFile[]> = null;
    beforeEach(() => {
      clearMocks();
      setup();

      uploadingFiles = new Map();
      const itemFiles = { id: 1 } as ItemFile;
      uploadingFiles.set(1, [itemFiles, itemFiles]);
      uploadingFiles.set(2, [itemFiles, itemFiles, itemFiles]);
      Object.assign(fileUploadController, {
        _uploadingFiles: uploadingFiles,
      });
    });

    it('should return recorded items by group id', () => {
      const gId = 1;
      const result = fileUploadController.getUploadItems(gId);
      expect(result).toEqual(uploadingFiles.get(gId));
      expect(result).toHaveLength(2);
    });

    it('should return [] when can not find the group id', () => {
      const gId = 666;
      const result = fileUploadController.getUploadItems(gId);
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
      Object.assign(fileUploadController, {
        _progressCaches: progressCaches,
      });
    });
    it('should return recorded progress by item id', () => {
      const gId = 3;
      const result = fileUploadController.getUploadProgress(gId);
      expect(result).toEqual(progressCaches.get(gId).progress);
    });

    it('should return undefined when the id is not recorded', () => {
      const result = fileUploadController.getUploadProgress(666);
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
        progress: { id: -3, rate: { total: 3, loaded: 5 } },
        requestHolder: r,
      });
      progressCaches.set(-4, {
        progress: { id: -4, rate: { total: 3, loaded: 5 } },
        requestHolder: r,
      });
      progressCaches.set(-5, {
        progress: { id: -5, rate: { total: 3, loaded: -1 } },
        requestHolder: r,
      });
      Object.assign(fileUploadController, {
        _progressCaches: progressCaches,
      });
    });

    it('should return SUCCESS when id > 0', () => {
      const ids = [1, 2];
      const result = fileUploadController.getItemsSendStatus(ids);
      expect(result).toEqual([
        PROGRESS_STATUS.SUCCESS,
        PROGRESS_STATUS.SUCCESS,
      ]);
    });

    it('should return FAIL when id is not in progress cache', () => {
      const ids = [-999];
      const result = fileUploadController.getItemsSendStatus(ids);
      expect(result).toEqual([PROGRESS_STATUS.FAIL]);
    });

    it('should return FAIL when progress is -1', () => {
      const ids = [-5];
      const result = fileUploadController.getItemsSendStatus(ids);
      expect(result).toEqual([PROGRESS_STATUS.FAIL]);
    });

    it('should return IN_PROGRESS when id is not in progress cache and has positive progress', () => {
      const ids = [-3, -4];
      const result = fileUploadController.getItemsSendStatus(ids);
      expect(result).toEqual([
        PROGRESS_STATUS.INPROGRESS,
        PROGRESS_STATUS.INPROGRESS,
      ]);
    });
  });

  describe('hasValidItemFile', () => {
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
      expect(await fileUploadController.hasValidItemFile(-1)).toBeTruthy();
      expect(itemDao.get).toBeCalledWith(-1);
    });

    it('should return true input id > 0', async () => {
      expect(await fileUploadController.hasValidItemFile(1)).toBeTruthy();
      expect(itemDao.get).not.toBeCalled();
    });

    it('should return false when can not find item in db', async () => {
      itemDao.get.mockResolvedValue(null);
      expect(await fileUploadController.hasValidItemFile(-1)).toBeFalsy();
      expect(itemDao.get).toBeCalledWith(-1);
    });

    it('should return true when has valid file', async () => {
      const progressCaches = new Map();
      Object.assign(fileUploadController, {
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
      expect(await fileUploadController.hasValidItemFile(-1)).toBeTruthy();
      expect(itemDao.get).toBeCalledWith(-1);
    });

    it('should return false when the cached file has no size', async () => {
      const progressCaches = new Map();
      Object.assign(fileUploadController, {
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
      expect(await fileUploadController.hasValidItemFile(-1)).toBeFalsy();
      expect(itemDao.get).toBeCalledWith(-1);
    });

    it('should return false when can not find file cache', async () => {
      const progressCaches = new Map();
      Object.assign(fileUploadController, {
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
      expect(await fileUploadController.hasValidItemFile(-1)).toBeFalsy();
      expect(itemDao.get).toBeCalledWith(-1);
    });
  });

  describe('cleanUploadingFiles()', () => {
    let uploadingFiles: Map<number, ItemFile[]> = null;
    beforeEach(() => {
      clearMocks();
      setup();

      uploadingFiles = new Map();
      const itemFiles = [{ id: 1 } as ItemFile, { id: 2 } as ItemFile];
      uploadingFiles.set(1, itemFiles);
      uploadingFiles.set(2, itemFiles);
      Object.assign(fileUploadController, {
        _uploadingFiles: uploadingFiles,
      });
    });
    it('should clean recorded uploading files by groupid and itemId', () => {
      fileUploadController.cleanUploadingFiles(1, [1]);
      expect(uploadingFiles.get(1)).toHaveLength(1);
      expect(uploadingFiles.get(1)[0].id).toBe(2);
      expect(uploadingFiles.get(2)).not.toBeUndefined();
    });

    it('should clean group when no item left after clean', () => {
      fileUploadController.cleanUploadingFiles(1, [1, 2]);
      expect(uploadingFiles.get(1)).toBeUndefined();
      expect(uploadingFiles.get(2)).not.toBeUndefined();
    });
  });

  describe('hasUploadingFiles', () => {
    let progressCaches = undefined;
    const groupId = 1;
    beforeEach(() => {
      clearMocks();
      setup();
      progressCaches = new Map();
    });

    function setFileCache(itemFile: any) {
      progressCaches.set(-1, {
        itemFile,
        progress: { rate: { loaded: 10 } },
      } as ItemFileUploadStatus);
      Object.assign(fileUploadController, {
        _progressCaches: progressCaches,
      });
    }

    it('should return false when has no file cache', () => {
      expect(fileUploadController.hasUploadingFiles()).toBeFalsy();
    });

    it('should return true when has files in uploading', () => {
      setFileCache({
        group_ids: [groupId],
        versions: [{ size: 1, stored_file_id: 0 }],
      });

      expect(fileUploadController.hasUploadingFiles()).toBeTruthy();
    });

    it('should return false when has no file in uploading', () => {
      setFileCache({
        group_ids: [groupId],
        versions: [{ size: 1, stored_file_id: 999 }],
      });

      expect(fileUploadController.hasUploadingFiles()).toBeFalsy();
    });
  });

  describe('setUploadItems', () => {
    let uploadingFiles = undefined;
    const progressCaches = new Map();
    beforeEach(() => {
      clearMocks();
      setup();
      uploadingFiles = new Map();
      Object.assign(fileUploadController, {
        _progressCaches: progressCaches,
      });
    });

    function setUpUploadingFiles(groupId: number, itemFiles: any[]) {
      uploadingFiles.set(groupId, itemFiles);
      Object.assign(fileUploadController, {
        _uploadingFiles: uploadingFiles,
      });
    }
    const groupId = 10;

    it('should use incoming ids directly when has no upload files before', async () => {
      const itemFiles = [];
      setUpUploadingFiles(groupId, itemFiles);

      const incomingIds = [-1, -4];
      entitySourceController.getEntitiesLocally = jest
        .fn()
        .mockReturnValue([
          { id: -1, name: 'name', is_new: true } as ItemFile,
          { id: -4, name: 'name', is_new: false } as ItemFile,
        ]);
      await fileUploadController.setUploadItems(groupId, incomingIds);
      const curIds = fileUploadController
        .getUploadItems(groupId)
        .map(x => x.id);
      expect(curIds).toEqual([-1, -4]);
      expect(progressCaches.has(-4)).not.toBeUndefined();
      expect(progressCaches.has(-1)).not.toBeUndefined();
    });

    it('should compare and insert incoming itemIds to uploadFiles when has uploadFiles before', async () => {
      const itemFiles = [
        { id: -1, name: 'name', is_new: true } as ItemFile,
        { id: -2, name: 'name', is_new: false } as ItemFile,
      ];

      setUpUploadingFiles(groupId, itemFiles);
      const previousItems = fileUploadController
        .getUploadItems(groupId)
        .map(x => x.id);
      const incomingIds = [-1, -4];
      entitySourceController.getEntitiesLocally = jest
        .fn()
        .mockReturnValue([{ id: -4, name: 'name', is_new: false } as ItemFile]);
      await fileUploadController.setUploadItems(groupId, incomingIds);
      const curIds = fileUploadController
        .getUploadItems(groupId)
        .map(x => x.id);
      expect(previousItems).toEqual([-1, -2]);
      expect(curIds).toEqual([-1, -2, -4]);
      expect(progressCaches.has(-4)).not.toBeUndefined();
    });
  });
});
