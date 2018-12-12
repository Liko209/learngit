/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-05 09:30:00
 */

import { StoredFile, ItemFile, Item, Raw, Progress } from '../../models';
import AccountService from '../account';
import ItemAPI, { RequestHolder } from '../../api/glip/item';
import { transform } from '../utils';
import { versionHash } from '../../utils/mathUtils';
import { daoManager } from '../../dao';
import ItemDao from '../../dao/item';
import { BaseError } from '../../utils';
import { NetworkResult } from '../../api/NetworkResult';
import notificationCenter from '../notificationCenter';
import { mainLogger } from 'foundation';
import { ENTITY, SERVICE } from '../eventKey';
import { FILE_FORM_DATA_KEYS } from './constants';
import { ItemFileUploadStatus } from './itemFileUploadStatus';
import { ItemService } from './itemService';
import { SENDING_STATUS } from '../constants';
import { GlipTypeUtil, TypeDictionary } from '../../utils/glip-type-dictionary';
class ItemFileUploadHandler {
  private _progressCaches: Map<number, ItemFileUploadStatus> = new Map();
  private _uploadingFiles: Map<number, ItemFile[]> = new Map();

  async sendItemFile(
    groupId: number,
    file: FormData,
    isUpdate: boolean,
  ): Promise<ItemFile | null> {
    const fileFullName = file.get(FILE_FORM_DATA_KEYS.FILE_NAME) as
      | string
      | null;
    if (fileFullName) {
      const itemFile = this._toItemFile(groupId, fileFullName, isUpdate);
      await this._preSaveItemFile(itemFile);
      this._sendItemFile(groupId, itemFile, file, isUpdate);
      return itemFile;
    }
    return null;
  }

  async resendFailedFile(itemId: number) {
    const itemDao = daoManager.getDao(ItemDao);
    const itemInDB = (await itemDao.get(itemId)) as ItemFile;
    let sendFailed = false;
    if (itemInDB) {
      this._updatePreInsertItemStatus(itemInDB.id, SENDING_STATUS.INPROGRESS);
      const groupId = itemInDB.group_ids[0];
      const isUpdate = itemInDB.is_new;
      if (itemInDB.versions.length > 0) {
        await this._uploadItem(groupId, itemInDB, isUpdate);
      } else {
        const cacheItem = this._progressCaches.get(itemId);
        if (groupId && cacheItem && cacheItem.file) {
          await this._sendItemFile(groupId, itemInDB, cacheItem.file, isUpdate);
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
        this._uploadingFiles.set(
          id,
          itemFiles.filter((itemFile: ItemFile) => {
            const id = itemFile._id ? itemFile._id : itemFile.id;
            return id !== itemId;
          }),
        );
      }
    });

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

  cleanUploadingFiles(groupId: number) {
    this._uploadingFiles.delete(groupId);
  }

  private _updateProgress(progress: Progress) {
    const uploadStatus = this._progressCaches.get(progress.id);
    if (uploadStatus) {
      uploadStatus.progress = progress;
    }
    notificationCenter.emitEntityUpdate(ENTITY.PROGRESS, [progress]);
  }

  private async _sendItemFile(
    groupId: number,
    preInsertItem: ItemFile,
    file: FormData,
    isUpdate: boolean,
  ) {
    const requestHolder: RequestHolder = { request: undefined };
    const progress = {
      id: preInsertItem.id,
      total: 0,
      loaded: 0,
    };

    const status = this._progressCaches.get(preInsertItem.id);
    if (status) {
      status.requestHolder = requestHolder;
      status.progress = progress;
    } else {
      this._progressCaches.set(preInsertItem.id, {
        requestHolder,
        progress,
      });
    }

    const uploadRes = await ItemAPI.uploadFileItem(
      file,
      (e: ProgressEventInit) => {
        const { loaded, total } = e;
        if (loaded && total) {
          this._updateProgress({
            total,
            loaded,
            groupId,
            id: preInsertItem.id,
          });
        }
      },
      requestHolder,
    );

    if (uploadRes.isOk()) {
      const storedFile = uploadRes.unwrap()[0];
      await this._handleFileUploadSuccess(storedFile, groupId, preInsertItem);
      await this._uploadItem(groupId, preInsertItem, isUpdate);
    } else {
      this._handleItemFileSendFailed(preInsertItem.id);
      mainLogger.error(`_sendItemFile, uploadRes error =>${uploadRes}`);
    }
  }

  private async _uploadItem(
    groupId: number,
    preInsertItem: ItemFile,
    isUpdate: boolean,
  ) {
    let result: NetworkResult<Raw<ItemFile>, BaseError> | undefined = undefined;

    let existItemFile: ItemFile | null = null;
    if (isUpdate) {
      existItemFile = await this._getOldestExistFile(
        groupId,
        preInsertItem.name,
      );
    }

    if (existItemFile) {
      result = await this._updateItem(existItemFile, preInsertItem);
    } else {
      result = await this._newItem(groupId, preInsertItem);
    }

    if (result && result.isOk) {
      const data = result.unwrap();
      const fileItem = transform<ItemFile>(data);
      this._handleItemUploadSuccess(preInsertItem, fileItem);
    } else {
      this._handleItemFileSendFailed(preInsertItem.id);
      mainLogger.error(`_uploadItem error =>${result}`);
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
    itemDao.update(preInsertItem);

    this._partialUpdateItemFile({
      id: preInsertItem.id,
      _id: preInsertItem.id,
      versions: [fileVersion],
    });
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
      } else {
        files.push(newItemFile);
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

    const groupId = preInsertItem.group_ids[0];
    const uploadingFiles = this._uploadingFiles.get(groupId);
    if (uploadingFiles) {
      const filteredRes = uploadingFiles.filter((e: ItemFile) => {
        return e.id !== preInsertId;
      });
      filteredRes.push(itemFile);
      this._uploadingFiles.set(groupId, filteredRes);
    }

    const replaceItemFiles = new Map<number, ItemFile>();
    replaceItemFiles.set(preInsertId, itemFile);
    notificationCenter.emitEntityReplace(ENTITY.ITEM, replaceItemFiles);
    this._emitItemFileStatus(true, preInsertId, itemFile.id);
  }

  private _handleItemFileSendFailed(preInsertId: number) {
    this._updatePreInsertItemStatus(preInsertId, SENDING_STATUS.FAIL);
    this._emitItemFileStatus(false, preInsertId, preInsertId);

    this._partialUpdateItemFile({
      id: preInsertId,
      _id: preInsertId,
      status: SENDING_STATUS.FAIL,
    });
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

  private async _preSaveItemFile(itemFile: ItemFile) {
    const groupId = itemFile.group_ids[0];
    const itemFiles = this._uploadingFiles[groupId];
    if (itemFiles) {
      this._uploadingFiles[groupId].push(itemFile);
    } else {
      this._uploadingFiles.set(groupId, [itemFile]);
    }

    const itemDao = daoManager.getDao(ItemDao);
    await itemDao.put(itemFile);

    this._updatePreInsertItemStatus(itemFile.id, SENDING_STATUS.INPROGRESS);
  }

  private _updatePreInsertItemStatus(itemId: number, status: SENDING_STATUS) {
    const itemService: ItemService = ItemService.getInstance();
    itemService.updatePreInsertItemStatus(itemId, status);
  }

  private _toItemFile(
    groupId: number,
    fileFullName: string,
    isNew: boolean,
  ): ItemFile {
    const nameType = this._extractFileNameAndType(fileFullName);
    const accountService: AccountService = AccountService.getInstance();
    const userId = accountService.getCurrentUserId() as number;
    const companyId = accountService.getCurrentCompanyId() as number;
    const now = Date.now();
    const id = GlipTypeUtil.convertToIdWithType(
      TypeDictionary.TYPE_ID_FILE,
      now,
    );

    return {
      id,
      created_at: now,
      modified_at: now,
      creator_id: userId,
      is_new: isNew,
      deactivated: false,
      version: versionHash(),
      group_ids: [groupId],
      post_ids: [],
      company_id: companyId,
      name: nameType.name,
      type_id: 1,
      type: nameType.type,
      versions: [],
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

  private _extractFileNameAndType(storagePath: string) {
    const options = {
      name: '',
      type: '',
    };
    const arr = storagePath.split('/');
    if (arr && arr.length > 0) {
      const name = arr[arr.length - 1];
      options.name = name;
      const seArr = name.split('.');
      if (seArr.length > 1) {
        options.type = seArr[seArr.length - 1];
      }
    }
    return options;
  }

  private _emitItemFileStatus(
    success: boolean,
    preInsertId: number,
    updatedId: number,
  ) {
    notificationCenter.emit(SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS, {
      success,
      preInsertId,
      updatedId,
    });
  }

  private async _updateItem(existItem: ItemFile, preInsertItem: ItemFile) {
    existItem.is_new = false;
    existItem.versions = existItem.versions.concat(preInsertItem.versions);
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
}

export { ItemFileUploadHandler };
