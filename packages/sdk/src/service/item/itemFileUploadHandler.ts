/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-05 09:30:00
 */
import { NETWORK_FAIL_TYPE, mainLogger } from 'foundation';
import { StoredFile, ItemFile, Item, Raw, Progress } from '../../models';
import AccountService from '../account';
import ItemAPI, { RequestHolder } from '../../api/glip/item';
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
    if (file.has(FILE_FORM_DATA_KEYS.FILE)) {
      const itemFile = this._toItemFile(groupId, file, isUpdate);
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
      const version = itemInDB.versions[0];
      if (
        version &&
        version.download_url.length > 0 &&
        version.url.length > 0
      ) {
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
      this._handleItemFileSendFailed(preInsertItem.id, uploadRes);
      mainLogger.warn(`_sendItemFile error =>${uploadRes}`);
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

    if (result && result.isOk) {
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

  private _handleItemFileSendFailed<T>(
    preInsertId: number,
    errRes?: ApiResultErr<T>,
  ) {
    if (errRes && errRes.response.statusText === NETWORK_FAIL_TYPE.CANCELLED) {
      mainLogger.info(`the request has been canceled, ${errRes}`);
      return;
    }

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
    formFile: FormData,
    isNew: boolean,
  ): ItemFile {
    const file = formFile.get(FILE_FORM_DATA_KEYS.FILE) as File;
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
      is_new: isNew,
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
