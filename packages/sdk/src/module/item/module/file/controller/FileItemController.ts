/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-03 13:54:21
 * Copyright © RingCentral. All rights reserved.
 */
import { buildPartialModifyController } from '../../../../../framework/controller';
import { FileUploadController } from '../controller/FileUploadController';
import { daoManager } from '../../../../../dao';
import { ItemDao } from '../../../dao';
import { Item, ItemFile } from '../../../entity';
import { FileActionController } from './FileActionController';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
class FileItemController {
  private _fileActionController: FileActionController;
  private _fileUploadController: FileUploadController;

  constructor(private _entitySourceController: IEntitySourceController<Item>) {}

  get fileActionController() {
    if (!this._fileActionController) {
      const partialModifyController = buildPartialModifyController<Item>(
        this._entitySourceController,
      );
      this._fileActionController = new FileActionController(
        partialModifyController,
        this._entitySourceController,
      );
    }
    return this._fileActionController;
  }

  get fileUploadController() {
    if (!this._fileUploadController) {
      const partialModifyController = buildPartialModifyController<Item>(
        this._entitySourceController,
      );

      this._fileUploadController = new FileUploadController(
        partialModifyController,
        this._entitySourceController,
      );
    }

    return this._fileUploadController;
  }

  async isFileExists(groupId: number, fileName: string): Promise<boolean> {
    if (groupId <= 0 || !fileName || fileName.trim().length === 0) {
      return false;
    }
    const dao = daoManager.getDao(ItemDao) as ItemDao;
    const files = await dao.getExistGroupFilesByName(groupId, fileName, true);
    return files.length > 0
      ? files.some((x: ItemFile) => {
          return x.post_ids.length > 0;
        })
      : false;
  }
}

export { FileItemController };
