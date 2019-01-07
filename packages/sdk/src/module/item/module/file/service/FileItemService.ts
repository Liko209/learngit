/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 13:24:02
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { FileItemController } from '../controller/FileItemController';
import { ItemFile } from '../../../entity';
import { daoManager } from '../../../../../dao';
import { Progress } from '../../../../progress';
import { EntityBaseService } from '../../../../../framework/service/EntityBaseService';
import { IItemService } from '../../../service/IItemService';
import { FileItemDao } from '../dao/FileItemDao';
import { SanitizedFileItem, FileItem } from '../entity';

class FileItemService extends EntityBaseService<ItemFile>
  implements ISubItemService {
  private _fileItemController: FileItemController;

  constructor(private _itemService: IItemService) {
    super();
  }

  getSortedIds(
    groupId: number,
    limit: number,
    offset: number,
    sortKey: string,
    desc: boolean,
  ): number[] {
    return [];
  }

  protected get fileItemController() {
    if (!this._fileItemController) {
      this._fileItemController = new FileItemController(
        this._itemService,
        this.getControllerBuilder(),
      );
    }
    return this._fileItemController;
  }

  protected get fileUploadController() {
    return this.fileItemController.fileUploadController;
  }

  async sendItemFile(
    groupId: number,
    file: File,
    isUpdate: boolean,
  ): Promise<ItemFile | null> {
    return await this.fileUploadController.sendItemFile(
      groupId,
      file,
      isUpdate,
    );
  }

  deleteFileCache(id: number) {
    this.fileUploadController.deleteFileCache(id);
  }

  async sendItemData(groupId: number, fileItemIds: number[]) {
    await this.fileUploadController.sendItemData(groupId, fileItemIds);
  }

  async getFileItemVersion(itemFile: ItemFile): Promise<number> {
    return await this.fileUploadController.getFileVersion(itemFile);
  }

  async cancelUpload(itemId: number) {
    await this.fileUploadController.cancelUpload(itemId);
  }

  getUploadItems(groupId: number): ItemFile[] {
    return this.fileUploadController.getUploadItems(groupId);
  }

  async hasValidItemFile(itemId: number) {
    return await this.fileUploadController.hasValidItemFile(itemId);
  }

  async resendFailedFile(itemId: number) {
    await this.fileUploadController.resendFailedFile(itemId);
  }

  async isFileExists(groupId: number, fileName: string): Promise<boolean> {
    return await this.fileItemController.isFileExists(groupId, fileName);
  }

  canUploadFiles(
    groupId: number,
    newFiles: File[],
    includeUnSendFiles: boolean,
  ): boolean {
    return this.fileUploadController.canUploadFiles(
      groupId,
      newFiles,
      includeUnSendFiles,
    );
  }

  getUploadProgress(itemId: number): Progress | undefined {
    return this.fileUploadController.getUploadProgress(itemId);
  }

  getItemsSendingStatus(itemIds: number[]) {
    return this.fileUploadController.getItemsSendStatus(itemIds);
  }

  cleanUploadingFiles(groupId: number, itemIds: number[]) {
    this.fileUploadController.cleanUploadingFiles(groupId, itemIds);
  }

  async updateItem(file: FileItem) {
    const sanitizedDao = daoManager.getDao<FileItemDao>(FileItemDao);
    await sanitizedDao.update(this._toSanitizedFile(file));
  }

  async deleteItem(itemId: number) {
    const sanitizedDao = daoManager.getDao<FileItemDao>(FileItemDao);
    await sanitizedDao.delete(itemId);
  }

  async createItem(file: FileItem) {
    const sanitizedDao = daoManager.getDao<FileItemDao>(FileItemDao);
    await sanitizedDao.put(this._toSanitizedFile(file));
  }

  private _toSanitizedFile(file: FileItem) {
    return {
      id: file.id,
      group_ids: file.group_ids,
      created_at: file.created_at,
      name: file.name,
      type: file.type,
    } as SanitizedFileItem;
  }
}

export { FileItemService };
