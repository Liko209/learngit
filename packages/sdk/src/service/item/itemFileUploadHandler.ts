/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-05 09:30:00
 */

import { StoredFile, ItemFile, Raw, Progress } from '../../models';
import AccountService from '../account';
import ItemAPI from '../../api/glip/item';
import { transform } from '../utils';
import { versionHash } from '../../utils/mathUtils';
import { daoManager } from '../../dao';
import ItemDao from '../../dao/item';
import { BaseError } from '../../utils';
import { NetworkResult } from '../../api/NetworkResult';
import notificationCenter from '../notificationCenter';
import { mainLogger } from 'foundation';
import { ENTITY } from '../eventKey';
import { FILE_FORM_DATA_KEYS } from './constants';
import { filter } from 'minimatch';
import { func } from 'prop-types';

class ItemFileUploadHandler {
  private _progressCaches: Map<number, Progress>;
  private _uploadingFiles: Map<number, ItemFile[]>;
  async sendItemFile(
    groupId: number,
    file: FormData,
    isUpdate: boolean,
  ): Promise<ItemFile | null> {
    const fileFullName = file.get(FILE_FORM_DATA_KEYS.FILE_NAME) as
      | string
      | null;
    if (fileFullName) {
      const itemFile = this._toItemFile(groupId, fileFullName);
      await this._preInsertItemFile(itemFile);
      this._sendItemFile(groupId, itemFile, file, isUpdate);
      return itemFile;
    }
    return null;
  }

  async cancelUpload(itemId: number): Promise<boolean> {
    return true;
  }

  getUploadItems(groupId: number): ItemFile[] {
    return this._uploadingItemFiles.has(groupId)
      ? this._uploadingItemFiles[groupId]
      : [];
  }

  getUploadProgress(itemId: number): Progress | undefined {
    return this._uploadProgressCaches.has(itemId)
      ? this._uploadProgressCaches.get(itemId)
      : undefined;
  }

  updateProgress(progress: Progress) {
    this._uploadProgressCaches.set(progress.id, progress);
    notificationCenter.emitEntityUpdate(ENTITY.PROGRESS, [progress]);
  }

  private async _sendItemFile(
    groupId: number,
    preInsertItem: ItemFile,
    file: FormData,
    isUpdate: boolean,
  ) {
    const uploadRes = await ItemAPI.uploadFileItem(
      file,
      (e: ProgressEventInit) => {
        const { loaded, total } = e;
        if (loaded && total) {
          this.updateProgress({
            total,
            loaded,
            groupId,
            id: preInsertItem.id,
          });
          console.log(
            '​ItemFileHandler -> _uploadAndGenerateItem -> loaded && total',
            loaded,
            total,
          );
        }
      },
    );
    if (uploadRes.isOk()) {
      const storedFile = uploadRes.unwrap()[0];
      await this._handleFileUploadSuccess(
        groupId,
        preInsertItem.id,
        storedFile,
      );
      await this._uploadItem(groupId, preInsertItem, isUpdate, storedFile);
    } else {
      // To-Do, handle failed by emit progress entity change
      mainLogger.error(`_uploadAndGenerateItem uploadRes error =>${uploadRes}`);
    }
  }

  private async _uploadItem(
    groupId: number,
    preInsertItem: ItemFile,
    isUpdate: boolean,
    storedFile: StoredFile,
  ) {
    let result: NetworkResult<Raw<ItemFile>, BaseError> | undefined = undefined;

    let shouldUpdate = isUpdate;
    let existItemFile: ItemFile | null = null;
    if (isUpdate) {
      const nameType = this._extractFileNameAndType(storedFile.storage_path);
      existItemFile = await this._getOldestExistFile(groupId, nameType.name);
      if (!existItemFile) {
        // if item not exist in local, should create new one
        shouldUpdate = false;
      }
    }

    if (shouldUpdate && existItemFile) {
      result = await this._updateItem(existItemFile, storedFile);
    } else {
      result = await this._newItem(groupId, storedFile);
    }

    if (result && result.isOk) {
      const data = result.unwrap();
      const fileItem = transform<ItemFile>(data);
      this._handleUploadItemSuccess(preInsertItem, fileItem);
    } else {
      // To-Do, handle failed to create/update item.
      mainLogger.error(`_uploadItem error =>${result}`);
    }
  }

  private async _handleFileUploadSuccess(
    groupId: number,
    itemId: number,
    storedFile: StoredFile,
  ) {
    const itemDao = daoManager.getDao(ItemDao);
    const itemInDB = await itemDao.get(itemId);
    if (itemInDB) {
      const fileVersion = this._toFileVersion(storedFile);
      itemInDB.versions = [fileVersion];
      this._updateUploadingFiles(groupId, itemInDB);
      itemDao.update(itemInDB);
    }
  }

  private _updateUploadingFiles(groupId: number, newItemFile: ItemFile) {
    const files = this._uploadingItemFiles.get(groupId);
    if (files && files.length) {
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
      this._uploadingItemFiles.set(groupId, files);
    }
  }

  private async _handleUploadItemSuccess(
    preInsertItem: ItemFile,
    itemFile: ItemFile,
  ) {
    const preInsertId = preInsertItem.id;
    const itemDao = daoManager.getDao(ItemDao);
    await itemDao.delete(preInsertId);
    await itemDao.put(itemFile);

    const groupId = preInsertItem.group_ids[0];
    const uploadingFiles = this._uploadingItemFiles.get(groupId);
    if (uploadingFiles) {
      const filteredRes = uploadingFiles.filter((e: ItemFile) => {
        return e.id === preInsertId;
      });
      filteredRes.push(itemFile);
      this._uploadingItemFiles.set(groupId, filteredRes);
    }

    const replaceItemFiles = new Map<number, ItemFile>();
    replaceItemFiles.set(preInsertId, itemFile);
    notificationCenter.emitEntityReplace(ENTITY.ITEM, replaceItemFiles);
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

  private async _preInsertItemFile(itemFile: ItemFile) {
    const groupId = itemFile.group_ids[0];
    const itemFiles = this._uploadingItemFiles[groupId];
    if (itemFiles) {
      this._uploadingItemFiles[groupId].push(itemFile);
    } else {
      this._uploadingItemFiles.set(groupId, [itemFile]);
    }

    const itemDao = daoManager.getDao(ItemDao);
    await itemDao.put(itemFile);
  }

  private _toItemFile(groupId: number, fileFullName: string): ItemFile {
    const nameType = this._extractFileNameAndType(fileFullName);
    const accountService: AccountService = AccountService.getInstance();
    const userId = accountService.getCurrentUserId() as number;
    const companyId = accountService.getCurrentCompanyId() as number;
    const now = Date.now();
    const vers = versionHash();
    const id = vers < 0 ? vers : -vers;
    return {
      id,
      created_at: now,
      modified_at: now,
      creator_id: userId,
      is_new: true,
      deactivated: false,
      version: vers,
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

  private async _newItem(groupId: number, storedFile: StoredFile) {
    const nameType = this._extractFileNameAndType(storedFile.storage_path);
    const version = versionHash();
    const fileVersion = this._toFileVersion(storedFile);
    const fileItemOptions = {
      version,
      creator_id: Number(storedFile.creator_id),
      new_version: version,
      name: nameType.name,
      type: nameType.type,
      source: 'upload',
      no_post: true,
      group_ids: [Number(groupId)],
      post_ids: [],
      versions: [fileVersion],
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
    if (storagePath) {
      const arr = storagePath.split('/');
      if (arr && arr.length > 0) {
        const name = arr[arr.length - 1];
        options.name = name;
        const seArr = name.split('.');
        if (seArr.length > 1) {
          options.type = seArr[seArr.length - 1];
        }
      }
    }
    return options;
  }

  private get _uploadingItemFiles() {
    if (!this._uploadingFiles) {
      this._uploadingFiles = new Map();
    }
    return this._uploadingFiles;
  }

  private get _uploadProgressCaches() {
    if (!this._progressCaches) {
      this._progressCaches = new Map();
    }
    return this._progressCaches;
  }

  private async _updateItem(existItem: ItemFile, storedFile: StoredFile) {
    const fileVersion = this._toFileVersion(storedFile);
    existItem.is_new = false;
    existItem.versions.push(fileVersion);
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
    );
    if (existFiles && existFiles.length > 0) {
      const sorted = existFiles.sort((lhs, rhs) => {
        return lhs.created_at - rhs.created_at;
      });
      return sorted[0];
    }
    return null;
  }

  // private _emitItemFileStatus(
  //   itemFileId: number,
  //   totalSize: number,
  //   uploadedSize: number,
  // ) {
  //   // To-Do emit progress entity change
  // }
}

export { ItemFileUploadHandler };
