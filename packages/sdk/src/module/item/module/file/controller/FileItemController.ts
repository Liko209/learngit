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
import { daoManager, ItemDao } from '../../../../../dao';
import { FileItem } from '../entity';
import { IItemService } from '../../../service/IItemService';
import { Item } from '../../../entity';

class FileItemController {
  private _fileUploadController: FileUploadController;
  constructor(private _itemService: IItemService) {}

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
        this._itemService,
        partialModifyController,
        itemRequestController,
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
      ? files.some((x: FileItem) => {
        return x.post_ids.length > 0;
      })
      : false;
  }
}

export { FileItemController };
