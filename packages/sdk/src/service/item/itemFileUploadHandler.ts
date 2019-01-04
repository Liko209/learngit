/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-05 09:30:00
 */
import _ from 'lodash';
import { NETWORK_FAIL_TYPE, mainLogger } from 'foundation';
import { Progress } from '../../module/progress';
import { Raw } from '../../framework/model';
import { StoredFile, ItemFile, Item } from '../../module/item/entity';
import AccountService from '../account';
import ItemAPI, { RequestHolder } from '../../api/glip/item';
import { AmazonFileUploadPolicyData } from '../../api/glip/types';
import { transform } from '../utils';
import { versionHash } from '../../utils/mathUtils';
import { daoManager } from '../../dao';
import ItemDao from '../../dao/item';
import { BaseError } from '../../utils';
import { ApiResult, ApiResultErr } from '../../api/ApiResult';
import notificationCenter from '../notificationCenter';
import { ENTITY, SERVICE } from '../eventKey';
import { FILE_FORM_DATA_KEYS } from './constants';
import { ItemFileUploadStatus } from './itemFileUploadStatus';
import { ItemService } from './itemService';
import { PROGRESS_STATUS } from '../../module';
import { GlipTypeUtil, TypeDictionary } from '../../utils/glip-type-dictionary';
import { isInBeta, EBETA_FLAG } from '../account/clientConfig';

const MAX_UPLOADING_FILE_CNT = 10;
const MAX_UPLOADING_FILE_SIZE = 1 * 1024 * 1024 * 1024; // 1GB from bytes

class ItemFileUploadHandler {
  private _progressCaches: Map<number, ItemFileUploadStatus> = new Map();
  private _uploadingFiles: Map<number, ItemFile[]> = new Map();

  async sendItemFile(
    groupId: number,
    file: File,
    isUpdate: boolean,
  ): Promise<ItemFile | null> {
    if (file) {
      const itemFile = this._toItemFile(groupId, file, isUpdate);
      await this._preSaveItemFile(itemFile, file);
      this._sendItemFile(itemFile, file);
      return itemFile;
    }
    return null;
  }

  canUploadFiles(
    groupId: number,
    newFiles: File[],
    includeUnSendFiles: boolean,
  ): boolean {
    let result = false;
    do {
      if (newFiles.length > MAX_UPLOADING_FILE_CNT) {
        break;
      }

      const uploadingFileSize = _.sumBy(newFiles, (f: File) => {
        return f.size;
      });

      if (uploadingFileSize > MAX_UPLOADING_FILE_SIZE) {
        break;
      }

      const currentUploadingInfo = this._getGroupUploadingFileStatus(groupId);
      if (
        includeUnSendFiles &&
        currentUploadingInfo.fileCount + newFiles.length >
          MAX_UPLOADING_FILE_CNT
      ) {
        break;
      }

      if (
        currentUploadingInfo.filesSize + uploadingFileSize >
        MAX_UPLOADING_FILE_SIZE
      ) {
        break;
      }

      result = true;
    } while (false);

    return result;
  }

  private _getGroupUploadingFileStatus(groupId: number) {
    const files: ItemFile[] = [];
    this._progressCaches.forEach((status: ItemFileUploadStatus) => {
      if (
        status.itemFile &&
        status.itemFile.group_ids.includes(groupId) &&
        status.progress.rate &&
        status.progress.rate.loaded > -1
      ) {
        files.push(status.itemFile);
      }
    });

    const filesSize = _.sumBy(files, (itemFile: ItemFile) => {
      return this._getItemFileSize(itemFile);
    });
    return {
      filesSize,
      fileCount: files.length,
    };
  }

  private _getItemFileSize(itemFile: ItemFile) {
    return itemFile.versions.length > 0 ? itemFile.versions[0].size : 0;
  }

  private _getCachedItem(itemId: number) {
    const cache = this._progressCaches.get(itemId);
    return cache ? cache.itemFile : undefined;
  }

  async sendItemData(groupId: number, postItemIds: number[]) {
    const needWaitItemIds: number[] = [];
    postItemIds.forEach((id: number) => {
      const itemStatus = this._progressCaches.get(id);
      if (itemStatus && itemStatus.itemFile) {
        const item = itemStatus.itemFile;
        if (this._hasValidStoredFile(item)) {
          this._uploadItem(groupId, item, this._isUpdateItem(item));
        } else {
          needWaitItemIds.push(item.id);
        }
      }
    });

    if (needWaitItemIds.length > 0) {
      this._waitUntilAllItemCreated(groupId, needWaitItemIds);
    }
  }

  private _waitUntilAllItemCreated(
    groupId: number,
    uploadingItemFileIds: number[],
  ) {
    const listener = (params: {
      status: PROGRESS_STATUS;
      preInsertId: number;
      updatedId: number;
    }) => {
      // handle item upload result.
      const { status, preInsertId, updatedId } = params;
      if (
        !uploadingItemFileIds.includes(preInsertId) ||
        updatedId !== preInsertId
      ) {
        return;
      }
      _.remove(uploadingItemFileIds, (id: number) => {
        return id === preInsertId;
      });

      const item = this._getCachedItem(preInsertId);
      if (
        status === PROGRESS_STATUS.INPROGRESS &&
        item &&
        this._hasValidStoredFile(item)
      ) {
        this._uploadItem(groupId, item, this._isUpdateItem(item));
      }

      if (uploadingItemFileIds.length === 0) {
        notificationCenter.removeListener(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          listener,
        );
      }
    };

    notificationCenter.on(SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS, listener);
  }

  async canResendFailedFile(itemId: number) {
    let canResend = false;
    if (itemId < 0) {
      const itemDao = daoManager.getDao(ItemDao);
      const itemInDB = (await itemDao.get(itemId)) as ItemFile;
      if (itemInDB) {
        if (this._hasValidStoredFile(itemInDB)) {
          canResend = true;
        } else {
          const cacheItem = this._progressCaches.get(itemId);
          canResend = !!(
            cacheItem &&
            cacheItem.file &&
            cacheItem.file.size > 0
          );
        }
      }
    } else {
      canResend = true;
    }
    return canResend;
  }

  async resendFailedFile(itemId: number) {
    this._updateFileProgress(itemId, PROGRESS_STATUS.INPROGRESS);

    const itemDao = daoManager.getDao(ItemDao);
    const itemInDB = (await itemDao.get(itemId)) as ItemFile;
    let sendFailed = false;
    if (itemInDB) {
      const groupId = itemInDB.group_ids[0];
      const isUpdate = itemInDB.is_new;
      if (this._hasValidStoredFile(itemInDB)) {
        await this._uploadItem(groupId, itemInDB, isUpdate);
      } else {
        const cacheItem = this._progressCaches.get(itemId);
        if (groupId && cacheItem && cacheItem.file) {
          await this._sendItemFile(itemInDB, cacheItem.file);
        } else {
          sendFailed = true;
        }
      }
    } else {
      sendFailed = true;
    }
    if (sendFailed) {
      this._handleItemFileSendFailed(itemId);
    }
  }

  async cancelUpload(itemId: number) {
    const status = this._progressCaches.get(itemId);
    if (status) {
      ItemAPI.cancelUploadRequest(status.requestHolder);
      this._progressCaches.delete(itemId);
    }

    this._uploadingFiles.forEach((itemFiles: ItemFile[], id: number) => {
      if (itemFiles) {
        const items = itemFiles.filter((itemFile: ItemFile) => {
          const id = itemFile._id ? itemFile._id : itemFile.id;
          return id !== itemId;
        });
        if (items.length > 0) {
          this._uploadingFiles.set(id, items);
        } else {
          this._uploadingFiles.delete(id);
        }
      }
    });

    this._emitItemFileStatus(PROGRESS_STATUS.CANCELED, itemId, itemId);

    const itemDao = daoManager.getDao(ItemDao);
    await itemDao.delete(itemId);
    notificationCenter.emitEntityDelete(ENTITY.ITEM, [itemId]);
  }

  getUploadItems(groupId: number): ItemFile[] {
    return this._uploadingFiles.get(groupId) || [];
  }

  getUploadProgress(itemId: number): Progress | undefined {
    const status = this._progressCaches.get(itemId);
    return status ? status.progress : undefined;
  }

  cleanUploadingFiles(groupId: number, toRemoveItemIds: number[]) {
    let itemFiles = this._uploadingFiles.get(groupId);
    if (itemFiles) {
      itemFiles = _.differenceWith(
        itemFiles,
        toRemoveItemIds,
        (item: ItemFile, id: number) => {
          return id === item.id;
        },
      );

      if (itemFiles.length === 0) {
        this._uploadingFiles.delete(groupId);
      } else {
        this._uploadingFiles.set(groupId, itemFiles);
      }
    }
  }

  getItemsSendStatus(itemIds: number[]): PROGRESS_STATUS[] {
    const result: PROGRESS_STATUS[] = [];
    itemIds.forEach((id: number) => {
      if (id > 0) {
        result.push(PROGRESS_STATUS.SUCCESS);
      } else {
        const info = this._progressCaches.get(id);
        if (info) {
          result.push(
            info.progress.rate && info.progress.rate.loaded > -1
              ? PROGRESS_STATUS.INPROGRESS
              : PROGRESS_STATUS.FAIL,
          );
        } else {
          result.push(PROGRESS_STATUS.FAIL);
        }
      }
    });
    return result;
  }

  public async getUpdateItemVersion(itemFile: ItemFile) {
    let versionNumber = 0;
    if (itemFile) {
      if (itemFile.id > 0) {
        versionNumber = itemFile.versions.length;
      } else {
        const existItemFile = await this._getOldestExistFile(
          itemFile.group_ids[0],
          itemFile.name,
        );
        versionNumber = existItemFile ? existItemFile.versions.length + 1 : 0;
      }
    }

    return versionNumber;
  }

  private _updateFileProgress(failedItemId: number, status: PROGRESS_STATUS) {
    const info = this._progressCaches.get(failedItemId);
    if (info && info.progress && info.progress.rate) {
      let loaded = info.progress.rate.loaded;
      switch (status) {
        case PROGRESS_STATUS.FAIL:
          loaded = -1;
          break;
        case PROGRESS_STATUS.INPROGRESS:
          loaded = 0;
          break;
        case PROGRESS_STATUS.SUCCESS:
          loaded = info.progress.rate.total;
          break;
        default:
          break;
      }
      info.progress.rate.loaded = loaded;
      notificationCenter.emitEntityUpdate(ENTITY.PROGRESS, [info.progress]);
    }
  }

  private _updateProgress(
    event: ProgressEventInit,
    groupId: number,
    itemId: number,
  ) {
    const { loaded, total } = event;
    if (loaded && total) {
      const progress = {
        id: itemId, // id is item id
        rate: { total, loaded },
      };

      const uploadStatus = this._progressCaches.get(progress.id);
      if (uploadStatus) {
        uploadStatus.progress = progress;
      }
      notificationCenter.emitEntityUpdate(ENTITY.PROGRESS, [progress]);
    }
  }

  private _createFromDataWithPolicyData(
    file: File,
    extendFileData: AmazonFileUploadPolicyData,
  ) {
    const newFormFile = new FormData();
    const storedPostForm = extendFileData.signed_post_form;
    Object.getOwnPropertyNames(storedPostForm).forEach((val: string) => {
      newFormFile.append(val, storedPostForm[val]);
    });

    newFormFile.append(FILE_FORM_DATA_KEYS.CONTENT_TYPE, file.type);
    newFormFile.append(FILE_FORM_DATA_KEYS.FILE, file);
    return newFormFile;
  }

  private async _requestAmazonS3Policy(file: File) {
    return await ItemAPI.requestAmazonFilePolicy({
      size: file.size,
      filename: file.name,
      for_file_type: true,
      filetype: file.type,
    });
  }

  private async _uploadFileToAmazonS3(
    file: File,
    preInsertItem: ItemFile,
    requestHolder: RequestHolder,
  ) {
    const groupId = preInsertItem.group_ids[0];
    const itemId = preInsertItem.id;
    const policyResponse = await this._requestAmazonS3Policy(file);

    if (policyResponse.isOk()) {
      const extendFileData = policyResponse.unwrap();
      const formData = this._createFromDataWithPolicyData(file, extendFileData);
      const uploadResponse = await ItemAPI.uploadFileToAmazonS3(
        extendFileData.post_url,
        formData,
        (event: ProgressEventInit) => {
          this._updateProgress(event, groupId, itemId);
        },
        requestHolder,
      );
      if (uploadResponse.isOk()) {
        this._handleFileUploadSuccess(
          extendFileData.stored_file,
          groupId,
          preInsertItem,
        );
      } else {
        this._handleItemFileSendFailed(itemId, uploadResponse);
      }
    } else {
      this._handleItemFileSendFailed(itemId, policyResponse);
    }
  }

  private async _uploadFileFileToGlip(
    file: File,
    preInsertItem: ItemFile,
    requestHolder: RequestHolder,
  ) {
    const groupId = preInsertItem.group_ids[0];
    const itemId = preInsertItem.id;
    const formData = new FormData();
    formData.append(FILE_FORM_DATA_KEYS.FILE, file);
    const uploadRes = await ItemAPI.uploadFileItem(
      formData,
      (e: ProgressEventInit) => {
        this._updateProgress(e, groupId, itemId);
      },
      requestHolder,
    );

    if (uploadRes.isOk()) {
      await this._handleFileUploadSuccess(
        uploadRes.unwrap()[0],
        groupId,
        preInsertItem,
      );
    } else {
      this._handleItemFileSendFailed(preInsertItem.id, uploadRes);
      mainLogger.warn(`_sendItemFile error =>${uploadRes}`);
    }
  }

  private _getRequestHolder(preInsertItemId: number) {
    const uploadInfo = this._progressCaches.get(
      preInsertItemId,
    ) as ItemFileUploadStatus;
    return uploadInfo.requestHolder;
  }

  private async _sendItemFile(preInsertItem: ItemFile, file: File) {
    const requestHolder = this._getRequestHolder(preInsertItem.id);

    if (isInBeta(EBETA_FLAG.BETA_S3_DIRECT_UPLOADS)) {
      await this._uploadFileToAmazonS3(file, preInsertItem, requestHolder);
    } else {
      await this._uploadFileFileToGlip(file, preInsertItem, requestHolder);
    }
  }

  private async _uploadItem(
    groupId: number,
    preInsertItem: ItemFile,
    isUpdate: boolean,
  ) {
    let existItemFile: ItemFile | null = null;
    if (isUpdate) {
      existItemFile = await this._getOldestExistFile(
        groupId,
        preInsertItem.name,
      );
    }

    let result: ApiResult<Raw<ItemFile>, BaseError> | undefined = undefined;
    if (existItemFile) {
      result = await this._updateItem(existItemFile, preInsertItem);
    } else {
      result = await this._newItem(groupId, preInsertItem);
    }

    if (result && result.isOk()) {
      const data = result.unwrap();
      const fileItem = transform<ItemFile>(data);
      this._handleItemUploadSuccess(preInsertItem, fileItem);
    } else {
      this._handleItemFileSendFailed(preInsertItem.id, result as ApiResultErr<
        ItemFile
      >);
      mainLogger.warn(`_uploadItem error =>${result}`);
    }
  }

  private async _handleFileUploadSuccess(
    storedFile: StoredFile,
    groupId: number,
    preInsertItem: ItemFile,
  ) {
    const itemDao = daoManager.getDao(ItemDao);
    const fileVersion = this._toFileVersion(storedFile);
    preInsertItem.versions = [fileVersion];
    this._updateUploadingFiles(groupId, preInsertItem);
    this._updateCachedFilesStatus(preInsertItem);

    await itemDao.update(preInsertItem);
    const itemId = preInsertItem.id;
    await this._partialUpdateItemFile({
      id: itemId,
      _id: itemId,
      versions: [fileVersion],
    });
    this._emitItemFileStatus(PROGRESS_STATUS.INPROGRESS, itemId, itemId);
  }

  private _updateCachedFilesStatus(newItemFile: ItemFile) {
    const status = this._progressCaches.get(newItemFile.id);
    if (status) {
      status.itemFile = newItemFile;
    }
  }

  private _updateUploadingFiles(groupId: number, newItemFile: ItemFile) {
    const files = this._uploadingFiles.get(groupId);
    if (files && files.length > 0) {
      const pos = files
        .map((x: ItemFile) => {
          return x.id;
        })
        .indexOf(newItemFile.id);
      if (pos >= 0) {
        files[pos] = newItemFile;
      }
      this._uploadingFiles.set(groupId, files);
    }
  }

  private async _handleItemUploadSuccess(
    preInsertItem: ItemFile,
    itemFile: ItemFile,
  ) {
    const preInsertId = preInsertItem.id;
    const itemDao = daoManager.getDao(ItemDao);
    await itemDao.delete(preInsertId);
    await itemDao.put(itemFile);

    const replaceItemFiles = new Map<number, ItemFile>();
    replaceItemFiles.set(preInsertId, itemFile);
    notificationCenter.emitEntityReplace(ENTITY.ITEM, replaceItemFiles);
    this._emitItemFileStatus(PROGRESS_STATUS.SUCCESS, preInsertId, itemFile.id);
  }

  private _handleItemFileSendFailed<T>(
    preInsertId: number,
    errRes?: ApiResultErr<T>,
  ) {
    if (errRes && errRes.response.statusText === NETWORK_FAIL_TYPE.CANCELLED) {
      mainLogger.info(`the request has been canceled, ${errRes}`);
      return;
    }

    this._updateFileProgress(preInsertId, PROGRESS_STATUS.FAIL);

    this._emitItemFileStatus(PROGRESS_STATUS.FAIL, preInsertId, preInsertId);
  }

  private _partialUpdateItemFile(updateData: object) {
    const itemService: ItemService = ItemService.getInstance();
    itemService.handlePartialUpdate(
      updateData,
      undefined,
      async (updatedItem: Item) => {
        return updatedItem;
      },
    );
  }

  private _toFileVersion(storedFile: StoredFile) {
    return {
      stored_file_id: storedFile._id,
      url: storedFile.storage_url,
      download_url: storedFile.download_url,
      date: storedFile.last_modified,
      size: storedFile.size,
      creator_id: Number(storedFile.creator_id),
    };
  }

  private _isUpdateItem(itemFile: ItemFile) {
    return !itemFile.is_new;
  }

  private _saveItemFileToUploadingFiles(preInsertItem: ItemFile) {
    const groupId = preInsertItem.group_ids[0];
    let existFiles: ItemFile[] | undefined = this._uploadingFiles.get(groupId);
    if (existFiles && existFiles.length > 0) {
      if (this._isUpdateItem(preInsertItem)) {
        const toCancelIds: number[] = [];
        existFiles = existFiles.filter((item: ItemFile) => {
          if (!item.is_new && item.name === preInsertItem.name) {
            toCancelIds.push(item.id);
            return false;
          }
          return true;
        });

        toCancelIds.forEach((id: number) => {
          this.cancelUpload(id);
        });
      }
      existFiles.push(preInsertItem);
    } else {
      existFiles = [preInsertItem];
    }
    this._uploadingFiles.set(groupId, existFiles);
  }

  private _saveItemFileToProgressCache(preInsertItem: ItemFile, file: File) {
    const requestHolder: RequestHolder = { request: undefined };
    const progress = {
      id: preInsertItem.id,
      rate: { total: 0, loaded: 0 },
    };

    const preInsertItemId = preInsertItem.id;
    const status = this._progressCaches.get(preInsertItemId);
    if (status) {
      status.requestHolder = requestHolder;
      status.progress = progress;
      status.file = file;
      status.itemFile = preInsertItem;
    } else {
      this._progressCaches.set(preInsertItemId, {
        requestHolder,
        progress,
        file,
        itemFile: preInsertItem,
      });
    }
  }

  private async _preSaveItemFile(newItemFile: ItemFile, file: File) {
    this._saveItemFileToUploadingFiles(newItemFile);
    this._saveItemFileToProgressCache(newItemFile, file);

    const itemDao = daoManager.getDao(ItemDao);
    await itemDao.put(newItemFile);
  }

  private _toItemFile(
    groupId: number,
    file: File,
    isUpdate: boolean,
  ): ItemFile {
    const accountService: AccountService = AccountService.getInstance();
    const userId = accountService.getCurrentUserId() as number;
    const companyId = accountService.getCurrentCompanyId() as number;
    const now = Date.now();
    const id = GlipTypeUtil.generatePseudoIdByType(TypeDictionary.TYPE_ID_FILE);
    return {
      id,
      created_at: now,
      modified_at: now,
      creator_id: userId,
      is_new: !isUpdate,
      deactivated: false,
      version: versionHash(),
      group_ids: [groupId],
      post_ids: [],
      company_id: companyId,
      name: file.name,
      type_id: 10,
      type: file.type,
      versions: [{ download_url: '', size: file.size, url: '' }],
      url: '',
    };
  }

  private async _newItem(groupId: number, preInsertItem: ItemFile) {
    const version = versionHash();
    const fileItemOptions = {
      version,
      creator_id: Number(preInsertItem.creator_id),
      new_version: version,
      name: preInsertItem.name,
      type: preInsertItem.type,
      source: 'upload',
      no_post: true,
      group_ids: [Number(groupId)],
      post_ids: [],
      versions: preInsertItem.versions,
      created_at: Date.now(),
      is_new: true,
    };
    return await ItemAPI.sendFileItem(fileItemOptions);
  }

  private _emitItemFileStatus(
    status: PROGRESS_STATUS,
    preInsertId: number,
    updatedId: number,
  ) {
    notificationCenter.emit(SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS, {
      status,
      preInsertId,
      updatedId,
    });
  }

  private async _updateItem(existItem: ItemFile, preInsertItem: ItemFile) {
    existItem.is_new = false;
    existItem.versions = preInsertItem.versions.concat(existItem.versions);
    existItem.modified_at = Date.now();
    existItem._id = existItem.id;
    delete existItem.id;
    return await ItemAPI.putItem(existItem._id, 'file', existItem);
  }

  private async _getOldestExistFile(
    groupId: number,
    fileName: string,
  ): Promise<ItemFile | null> {
    const itemDao = daoManager.getDao(ItemDao);

    const existFiles = await itemDao.getExistGroupFilesByName(
      groupId,
      fileName,
      true,
    );
    if (existFiles && existFiles.length > 0) {
      const sorted = existFiles.sort((lhs, rhs) => {
        return lhs.created_at - rhs.created_at;
      });
      return sorted[0];
    }
    return null;
  }

  private _hasValidStoredFile(itemFile: ItemFile) {
    const version = itemFile.versions[0];
    return version && version.download_url.length > 0 && version.url.length > 0;
  }

  deleteFileCache(id: number) {
    this._progressCaches.delete(id);
  }
}

export { ItemFileUploadHandler };
