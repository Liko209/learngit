/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-03 13:54:21
 * Copyright © RingCentral. All rights reserved.
 */
import { ControllerBuilder } from '../../../../../framework/controller/impl/ControllerBuilder';
import { Api } from '../../../../../api';
import { daoManager, ItemDao } from '../../../../../dao';
import { Item, ItemFile } from '../../../entity';
import { IItemService } from '../../../service/IItemService';
import { FileActionController } from './FileActionController';
import { FileUploadController } from './FileUploadController';

class FileItemController {
  private _fileUploadController: FileUploadController;
  private _fileActionController: FileActionController;
  constructor(
    private _itemService: IItemService,
    private _controllerBuilder: ControllerBuilder<Item>,
  ) {}

  get fileActionController() {
    if (!this._fileActionController) {
      const itemRequestController = this._controllerBuilder.buildRequestController(
        {
          basePath: '/file',
          networkClient: Api.glipNetworkClient,
        },
      );
      const entitySourceController = this._controllerBuilder.buildEntitySourceController(
        daoManager.getDao(ItemDao),
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
      const itemRequestController = this._controllerBuilder.buildRequestController(
        {
          basePath: '/file',
          networkClient: Api.glipNetworkClient,
        },
      );

      const entitySourceController = this._controllerBuilder.buildEntitySourceController(
        daoManager.getDao(ItemDao),
        itemRequestController,
      );

      const partialModifyController = this._controllerBuilder.buildPartialModifyController(
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
      ? files.some((x: ItemFile) => {
        return x.post_ids.length > 0;
      })
      : false;
  }
}

export { FileItemController };
