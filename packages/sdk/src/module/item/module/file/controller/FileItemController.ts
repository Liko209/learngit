/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-03 13:54:21
 * Copyright © RingCentral. All rights reserved.
 */
import {
  buildRequestController,
  buildEntityPersistentController,
  buildEntitySourceController,
  buildPartialModifyController,
} from '../../../../../framework/controller';
import { FileUploadController } from '../controller/FileUploadController';
import { Api } from '../../../../../api';
import { daoManager } from '../../../../../dao';
import { ItemDao } from '../../../dao';
import { Item, ItemFile } from '../../../entity';
import { FileActionController } from './FileActionController';
class FileItemController {
  private _fileActionController: FileActionController;
  private _fileUploadController: FileUploadController;

  constructor() {}

  get fileActionController() {
    if (!this._fileActionController) {
      const itemRequestController = buildRequestController<Item>({
        basePath: '/file',
        networkClient: Api.glipNetworkClient,
      });

      const persistentController = buildEntityPersistentController<Item>(
        daoManager.getDao(ItemDao),
      );

      const entitySourceController = buildEntitySourceController<Item>(
        persistentController,
        itemRequestController,
      );

      this._fileActionController = new FileActionController(
        entitySourceController,
      );
    }
    return this._fileActionController;
  }

  get fileUploadController() {
    if (!this._fileUploadController) {
      const itemRequestController = buildRequestController<Item>({
        basePath: '/file',
        networkClient: Api.glipNetworkClient,
      });

      const persistentController = buildEntityPersistentController<Item>(
        daoManager.getDao(ItemDao),
      );

      const entitySourceController = buildEntitySourceController<Item>(
        persistentController,
        itemRequestController,
      );

      const partialModifyController = buildPartialModifyController<Item>(
        entitySourceController,
      );

      this._fileUploadController = new FileUploadController(
        partialModifyController,
        itemRequestController,
        entitySourceController,
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
