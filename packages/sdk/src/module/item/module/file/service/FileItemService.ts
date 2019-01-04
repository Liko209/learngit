/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 13:24:02
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../../base/service/ISubItemService';
import { FileItemController } from '../controller/FileItemController';
import { ItemFile, Item } from '../../../entity';
import { daoManager, ItemDao } from '../../../../../dao';
import { Progress } from '../../../../progress';
import { EntityBaseService } from '../../../../../framework/service/EntityBaseService';

class FileItemService extends EntityBaseService<ItemFile>
  implements ISubItemService {
  private _fileItemController: FileItemController;

  getSortedIds(
    groupId: number,
    limit: number,
    offset: number,
    sortKey: string,
    desc: boolean,
  ): number[] {
    return [];
  }

  updateItem(item: Item) {}

  protected get fileItemController() {
    if (!this._fileItemController) {
      this._fileItemController = new FileItemController(
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

  async resendFailedFiles(itemId: number) {
    await this.fileUploadController.resendFailedFile(itemId);
  }

  async isFileExists(groupId: number, fileName: string): Promise<boolean> {
    if (groupId <= 0 || !fileName || fileName.trim().length === 0) {
      return false;
    }
    const dao = daoManager.getDao(ItemDao) as ItemDao;
    const files = await dao.getExistGroupFilesByName(groupId, fileName, true);
    return files.length > 0
      ? files.some((x: Item) => {
        return x.post_ids.length > 0;
      })
      : false;
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
}

export { FileItemService };
