/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-03 13:54:21
 * Copyright © RingCentral. All rights reserved.
 */
import { ControllerBuilder } from '../../../../../framework/controller/impl/ControllerBuilder';
import { FileUploadController } from '../controller/FileUploadController';
import { Api } from '../../../../../api';
import { daoManager, ItemDao } from '../../../../../dao';
import { FileItem } from '../entity';
import { IItemService } from '../../../service/IItemService';

class FileItemController {
  private _fileUploadController: FileUploadController;
  constructor(
    private _itemService: IItemService,
    private _controllerBuilder: ControllerBuilder<FileItem>,
  ) {}

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
      ? files.some((x: FileItem) => {
        return x.post_ids.length > 0;
      })
      : false;
  }
}

export { FileItemController };
