/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-03 16:52:19
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { mainLogger } from 'foundation/log';
import { daoManager } from 'sdk/dao';
import { ItemDao } from '../../../dao';
import { Progress, PROGRESS_STATUS } from 'sdk/module/progress';
import { Raw } from 'sdk/framework/model';
import { StoredFile, ItemFile, Item } from '../../../entity';
import ItemAPI, { RequestHolder, ProgressCallback } from 'sdk/api/glip/item';
import { AmazonFileUploadPolicyData } from 'sdk/api/glip/types';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { versionHash } from 'sdk/utils/mathUtils';
import { FILE_FORM_DATA_KEYS } from '../constants';
import { ENTITY, SERVICE } from 'sdk/service/eventKey';
import notificationCenter from 'sdk/service/notificationCenter';
import { AccountService } from 'sdk/module/account/service';
import { IPartialModifyController } from 'sdk/framework/controller/interface/IPartialModifyController';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { GroupConfigService } from '../../../../groupConfig';
import { ItemNotification } from '../../../utils/ItemNotification';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import {
  SequenceProcessorHandler,
  IProcessor,
} from '../../../../../framework/processor';
/* eslint-disable */
const LOG_TAG = 'FileUploadController';
const MAX_UPLOADING_FILE_CNT = 10;
const MAX_UPLOADING_FILE_SIZE = 1 * 1024 * 1024 * 1024; // 1GB from bytes

type ItemFileUploadStatus = {
  progress: Progress;
  requestHolder?: RequestHolder;
  itemFile?: ItemFile;
  file?: File;
};

class UploadProcessor implements IProcessor {
  constructor(
    private _name: string,
    private _processFunc: () => Promise<void>,
  ) {}

  async process(): Promise<boolean> {
    try {
      await this._processFunc();
    } catch (e) {
      mainLogger.warn(
        LOG_TAG,
        `failed to execute UploadItemProcessor, ${this._name}`,
        e,
      );
    }
    return Promise.resolve(true);
  }

  name(): string {
    return this._name;
  }
}

class FileUploadController {
  private _progressCaches: Map<number, ItemFileUploadStatus> = new Map();
  private _uploadingFiles: Map<number, ItemFile[]> = new Map();
  private _canceledUploadFileIds: Set<number> = new Set();
  private _uploadFileQueue = new SequenceProcessorHandler({
    name: 'FileUploadController - upload file',
  });

  constructor(
    private _partialModifyController: IPartialModifyController<Item>,
    private _entitySourceController: IEntitySourceController<Item>,
  ) {}

  async sendItemFile(
    groupId: number,
    file: File,
    isUpdate: boolean,
  ): Promise<ItemFile | null> {
    if (file) {
      mainLogger.info(LOG_TAG, 'sendItemFile, start upload file', {
        groupId,
        isUpdate,
        file: file && file.name,
      });
      const itemFile = this._toItemFile(groupId, file, isUpdate);
      await this._preSaveItemFile(itemFile, file);
      this._sendItemFileInQueue(itemFile, file);
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
    mainLogger.tags(LOG_TAG).log('sendItemData', {
      groupId,
      postItemIds,
    });
    const expiredItemIds: number[] = [];
    const needWaitItemIds: number[] = [];
    postItemIds.forEach((id: number) => {
      const itemStatus = this._progressCaches.get(id);
      if (itemStatus && itemStatus.itemFile) {
        const item = itemStatus.itemFile;
        const file = itemStatus.file;
        if (this._hasValidStoredFile(item)) {
          this._uploadItem(groupId, item, this._isUpdateItem(item));
        } else if (file && file.size > 0) {
          needWaitItemIds.push(item.id);
        } else {
          expiredItemIds.push(item.id);
        }
      }
    });

    if (needWaitItemIds.length > 0) {
      this._waitUntilAllItemCreated(groupId, needWaitItemIds);
    }

    if (expiredItemIds.length > 0) {
      expiredItemIds.forEach((id: number) => {
        this._handleItemFileSendFailed(id);
      });
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

  async hasValidItemFile(itemId: number) {
    let canResend = false;
    if (itemId < 0) {
      const itemInDB = (await this._entitySourceController.get(
        itemId,
      )) as ItemFile;
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
    mainLogger.info(LOG_TAG, 'resendFailedFile', itemId);
    this._updateFileProgress(itemId, PROGRESS_STATUS.INPROGRESS);

    const itemInDB = (await this._entitySourceController.get(
      itemId,
    )) as ItemFile;
    let sendFailed = false;
    if (itemInDB) {
      const groupId = itemInDB.group_ids[0];
      if (this._hasValidStoredFile(itemInDB)) {
        await this._uploadItem(groupId, itemInDB, this._isUpdateItem(itemInDB));
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
    this._canceledUploadFileIds.add(itemId);
    const status = this._progressCaches.get(itemId);
    if (status) {
      if (status.requestHolder) {
        ItemAPI.cancelUploadRequest(status.requestHolder);
      }

      this._progressCaches.delete(itemId);
    }
    this._removeProcessor(itemId);

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

    await this._emitItemFileStatus(PROGRESS_STATUS.CANCELED, itemId, itemId);

    const item = await this._entitySourceController.get(itemId);

    if (item) {
      this._entitySourceController.delete(itemId);

      const notifications = ItemNotification.getItemsNotifications([item]);
      notifications.forEach(
        (notification: { eventKey: string; entities: Item[] }) => {
          notificationCenter.emitEntityDelete(
            notification.eventKey,
            notification.entities.map((item: Item) => {
              return item.id;
            }),
          );
        },
      );
    }
  }

  getUploadItems(groupId: number): ItemFile[] {
    return this._uploadingFiles.get(groupId) || [];
  }

  async initialUploadItemsFromDraft(groupId: number) {
    const groupConfigService = ServiceLoader.getInstance<GroupConfigService>(
      ServiceConfig.GROUP_CONFIG_SERVICE,
    );
    const itemIds = await groupConfigService.getDraftAttachmentItemIds(groupId);
    const fileIds = itemIds.filter(
      (id: number) =>
        GlipTypeUtil.extractTypeId(id) === TypeDictionary.TYPE_ID_FILE,
    );

    if (fileIds) {
      await this._setUploadItems(groupId, fileIds);
      return this.getUploadItems(groupId);
    }

    return [];
  }

  private async _setUploadItems(groupId: number, itemIds: number[]) {
    const existFile = this.getUploadItems(groupId);
    let toFetchItemIds: number[] = [];
    if (existFile.length > 0) {
      toFetchItemIds = _.difference(itemIds, existFile.map(x => x.id));
    } else {
      toFetchItemIds = itemIds;
    }

    if (toFetchItemIds.length > 0) {
      const toFetchItems = (await this._entitySourceController.getEntitiesLocally(
        toFetchItemIds,
        false,
      )) as Item[];
      this._uploadingFiles.set(groupId, existFile.concat(toFetchItems));
      this._saveToItemFileCache(toFetchItems);
    }
  }

  private _saveToItemFileCache(items: Item[]) {
    items.forEach((item: Item) => {
      if (!this._progressCaches.has(item.id)) {
        const hasUploaded = this._hasValidStoredFile(item);
        this._progressCaches.set(item.id, {
          progress: {
            id: item.id,
            rate: {
              loaded: hasUploaded ? 1 : -1,
              total: 1,
            },
            status: hasUploaded
              ? PROGRESS_STATUS.SUCCESS
              : PROGRESS_STATUS.FAIL,
          },
          itemFile: item,
        });
      }
    });
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

  public async getFileVersion(itemFile: ItemFile) {
    let versionNumber = 0;
    if (itemFile) {
      if (itemFile.id > 0) {
        versionNumber = itemFile.versions.length;
      } else {
        const existItemFile =
          !itemFile.is_new &&
          (await this._getOldestExistFile(
            itemFile.group_ids[0],
            itemFile.name,
          ));
        versionNumber = existItemFile ? existItemFile.versions.length + 1 : 1;
      }
    }

    return versionNumber;
  }

  private _updateFileProgress(failedItemId: number, status: PROGRESS_STATUS) {
    if (!this._progressCaches.has(failedItemId)) {
      this._progressCaches.set(failedItemId, {
        progress: { rate: { loaded: 0, total: 0 } },
      } as ItemFileUploadStatus);
    }
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
      info.progress.status = status;
      notificationCenter.emitEntityUpdate(ENTITY.PROGRESS, [info.progress]);
    }
  }

  private _updateProgress(event: ProgressEventInit, itemId: number) {
    const { loaded, total } = event;
    if (loaded && total) {
      const rate = { total, loaded };

      const uploadStatus = this._progressCaches.get(itemId);
      if (uploadStatus) {
        uploadStatus.progress.rate = rate;
        notificationCenter.emitEntityUpdate(ENTITY.PROGRESS, [
          uploadStatus.progress,
        ]);
      }
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
      filetype: this._getFileType(file),
    });
  }

  async uploadFileToAmazonServer(
    file: File,
    updateProgress?: ProgressCallback,
    requestHolder?: RequestHolder,
  ) {
    const extendFileData = await this._requestAmazonS3Policy(file);
    const formData = this._createFromDataWithPolicyData(file, extendFileData);
    mainLogger.tags(LOG_TAG).log('_createFromDataWithPolicyData done', {
      stored_file: extendFileData && extendFileData.stored_file,
    });
    await ItemAPI.uploadFileToAmazonS3(
      extendFileData.post_url,
      formData,
      (event: ProgressEventInit) => {
        updateProgress && updateProgress(event);
      },
      requestHolder,
    );
    mainLogger
      .tags(LOG_TAG)
      .log('_uploadFileToAmazonS3 done', {
        stored_file: extendFileData && extendFileData.stored_file,
      });
    return extendFileData.stored_file;
  }

  private async _uploadFileToAmazonS3(
    file: File,
    preInsertItem: ItemFile,
    requestHolder?: RequestHolder,
  ) {
    const groupId = preInsertItem.group_ids[0];
    const itemId = preInsertItem.id;
    try {
      const storedFile = await this.uploadFileToAmazonServer(file, (event: ProgressEventInit)=>{
        this._updateProgress(event, itemId);
      }, requestHolder)

      this._handleFileUploadSuccess(
        storedFile,
        groupId,
        preInsertItem,
      );
    } catch (error) {
      mainLogger.info(LOG_TAG, '_uploadFileToAmazonS3 failed', {
        itemId,
        error,
      });
      this._handleItemFileSendFailed(itemId);
    }
  }

  private _getRequestHolder(preInsertItemId: number) {
    const uploadInfo = this._progressCaches.get(
      preInsertItemId,
    ) as ItemFileUploadStatus;
    return uploadInfo.requestHolder as RequestHolder;
  }

  private async _sendItemFile(preInsertItem: ItemFile, file: File) {
    const requestHolder = this._getRequestHolder(preInsertItem.id);
    await this._uploadFileToAmazonS3(file, preInsertItem, requestHolder);
  }

  private async _sendItemFileInQueue(preInsertItem: ItemFile, file: File) {
    const processor = new UploadProcessor(
      this._generateProcessorName(preInsertItem.id),
      async () => {
        await this._sendItemFile(preInsertItem, file);
        mainLogger
          .tags(LOG_TAG)
          .log(
            `_sendItemFileInQueue, done for ${preInsertItem.id}_${
              preInsertItem.name
            }`,
          );
      },
    );

    this._uploadFileQueue.addProcessor(processor);
  }

  private async _uploadItem(
    groupId: number,
    preInsertItem: ItemFile,
    isUpdate: boolean,
  ) {
    mainLogger.tags(LOG_TAG).log('_uploadItem', {
      groupId,
      isUpdate,
      preInsertItemId: preInsertItem.id,
    });
    let existItemFile: ItemFile | null = null;
    if (isUpdate) {
      existItemFile = await this._getOldestExistFile(
        groupId,
        preInsertItem.name,
      );
    }

    try {
      // in order to keep file time close to item time to keep item order same as file order
      preInsertItem.versions[0].date = Date.now();
      let result: ItemFile | undefined;
      if (existItemFile) {
        result = (await this._updateItem(
          existItemFile,
          preInsertItem,
        )) as ItemFile;
      } else {
        result = (await this._newItem(groupId, preInsertItem)) as ItemFile;
      }
      await this._handleItemUploadSuccess(preInsertItem, result);
    } catch (error) {
      this._handleItemFileSendFailed(preInsertItem.id);
    }
  }

  private async _handleFileUploadSuccess(
    storedFile: StoredFile,
    groupId: number,
    preInsertItem: ItemFile,
  ) {
    const fileVersion = this._toFileVersion(storedFile);
    preInsertItem.versions = [fileVersion];
    this._updateUploadingFiles(groupId, preInsertItem);
    this._updateCachedFilesStatus(preInsertItem);

    const itemId = preInsertItem.id;
    const preHandlePartial = (
      partialPost: Partial<Raw<ItemFile>>,
      originalPost: ItemFile,
    ): Partial<Raw<ItemFile>> => {
      return {
        id: itemId,
        _id: itemId,
        versions: [fileVersion],
      };
    };
    await this._partialModifyController.updatePartially(
      {entityId:itemId,
      preHandlePartialEntity:preHandlePartial,
      doUpdateEntity:async (updateModel: ItemFile) => {
        mainLogger
          .tags(LOG_TAG)
          .log('_handleFileUploadSuccess, updatePartially', updateModel.id);
        return updateModel;
      },}
    );
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
    mainLogger.tags(LOG_TAG).log('_handleItemUploadSuccess', {
      preInsertItemId: preInsertItem.id,
      itemFileId: itemFile.id,
    });
    const preInsertId = preInsertItem.id;
    await this._entitySourceController.delete(preInsertId);
    await this._entitySourceController.update(itemFile);

    const notifications = ItemNotification.getItemsNotifications([itemFile]);
    notifications.forEach(
      (notification: { eventKey: string; entities: Item[] }) => {
        const replaceItemFiles = new Map<number, ItemFile>();
        replaceItemFiles.set(preInsertId, notification.entities[0]);
        notificationCenter.emitEntityReplace(
          notification.eventKey,
          replaceItemFiles,
        );
      },
    );

    await this._emitItemFileStatus(
      PROGRESS_STATUS.SUCCESS,
      preInsertId,
      itemFile.id,
    );
  }

  private _handleItemFileSendFailed(preInsertId: number) {
    mainLogger.tags(LOG_TAG).log('_handleItemFileSendFailed', { preInsertId });
    if (this._canceledUploadFileIds.has(preInsertId)) {
      return;
    }
    this._updateFileProgress(preInsertId, PROGRESS_STATUS.FAIL);

    this._emitItemFileStatus(PROGRESS_STATUS.FAIL, preInsertId, preInsertId);
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
      status: PROGRESS_STATUS.INPROGRESS,
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
    await this._entitySourceController.put(newItemFile);
  }

  private _toItemFile(
    groupId: number,
    file: File,
    isUpdate: boolean,
  ): ItemFile {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const companyId: number = userConfig.getCurrentCompanyId();
    const userId: number = userConfig.getGlipUserId();
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
      type: this._getFileType(file),
      versions: [
        {
          creator_id: userId,
          download_url: '',
          size: file.size,
          url: '',
          stored_file_id: 0,
          date: now,
        },
      ],
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
      is_new: true,
    };
    const requestController = this._entitySourceController.getRequestController();
    return await requestController!.post(fileItemOptions);
  }

  private async _emitItemFileStatus(
    status: PROGRESS_STATUS,
    preInsertId: number,
    updatedId: number,
  ) {
    mainLogger
      .tags(LOG_TAG)
      .log('_emitItemFileStatus', { status, preInsertId, updatedId });
    await notificationCenter.emitAsync(
      SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
      {
        status,
        preInsertId,
        updatedId,
      },
    );
  }

  private async _updateItem(
    existItem: ItemFile,
    preInsertItem: ItemFile,
    updateModifiedAt?: boolean,
  ) {
    existItem.is_new = false;
    existItem.versions = preInsertItem.versions.concat(existItem.versions);
    updateModifiedAt && (existItem.modified_at = Date.now());
    existItem._id = existItem.id;
    delete existItem.id;
    const requestController = this._entitySourceController.getRequestController();
    return await requestController!.put(existItem);
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

  private _getFileType(file: File) {
    const fileName = file.name;
    let type: string = '';
    if (fileName) {
      const arr = fileName.split('/');
      if (arr && arr.length > 0) {
        const name = arr[arr.length - 1];
        const seArr = name.split('.');
        type = seArr && seArr.length > 1 ? seArr[seArr.length - 1] : '';
      }
    }
    return type;
  }

  hasUploadingFiles() {
    let hasUploading = false;
    const uploadingFiles = Array.from(this._progressCaches.values());
    for (let i = 0; i < uploadingFiles.length; i++) {
      const fileStatus = uploadingFiles[i];
      if (
        fileStatus &&
        this._isFileInUploading(fileStatus) &&
        fileStatus.itemFile &&
        !this._hasValidStoredFile(fileStatus.itemFile)
      ) {
        hasUploading = true;
        break;
      }
    }
    return hasUploading;
  }

  private _isFileInUploading(fileStatus: ItemFileUploadStatus) {
    const progress = fileStatus.progress;
    return progress.status === PROGRESS_STATUS.INPROGRESS;
  }

  private _generateProcessorName(itemId: number) {
    return `${itemId}`;
  }

  private _removeProcessor(itemId: number) {
    const name = this._generateProcessorName(itemId);
    this._uploadFileQueue.removeProcessorByName(name);
  }
}

export { FileUploadController, ItemFileUploadStatus };
