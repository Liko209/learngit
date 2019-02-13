/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 13:24:02
 * Copyright © RingCentral. All rights reserved.
 */

import { FileItemController } from '../controller/FileItemController';
import { ItemFile } from '../../../entity';
import { daoManager } from '../../../../../dao';
import { Progress } from '../../../../progress';
import { IItemService } from '../../../service/IItemService';
import { FileItemDao } from '../dao/FileItemDao';
import { SanitizedFileItem, FileItem } from '../entity';
import { BaseSubItemService } from '../../base/service/BaseSubItemService';

class FileItemService extends BaseSubItemService<FileItem, SanitizedFileItem> {
  private _fileItemController: FileItemController;

  constructor(private _itemService: IItemService) {
    super(daoManager.getDao<FileItemDao>(FileItemDao));
  }

  protected get fileItemController() {
    if (!this._fileItemController) {
      this._fileItemController = new FileItemController(this._itemService);
    }
    return this._fileItemController;
  }

  protected get fileUploadController() {
    return this.fileItemController.fileUploadController;
  }

  protected get fileActionController() {
    return this.fileItemController.fileActionController;
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

  async setUploadItems(groupId: number, itemIds: number[]) {
    return await this.fileUploadController.setUploadItems(groupId, itemIds);
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

  toSanitizedItem(file: FileItem) {
    return {
      ...super.toSanitizedItem(file),
      name: file.name,
      type: file.type,
    } as SanitizedFileItem;
  }

  async getThumbsUrlWithSize(itemId: number, width: number, height: number) {
    return await this.fileActionController.getThumbsUrlWithSize(
      itemId,
      width,
      height,
    );
  }

  hasUploadingFiles() {
    return this.fileUploadController.hasUploadingFiles();
  }
}

export { FileItemService };
