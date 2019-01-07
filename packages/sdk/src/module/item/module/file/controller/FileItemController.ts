/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-03 13:54:21
 * Copyright © RingCentral. All rights reserved.
 */
import { ControllerBuilder } from '../../../../../framework/controller/impl/ControllerBuilder';
import { FileUploadController } from '../controller/FileUploadController';
import { Api } from '../../../../../api';
import { daoManager, ItemDao } from '../../../../../dao';
import { FileItemDao } from '../dao/FileItemDao';
import { SanitizedFileItem, FileItem } from '../entity';
import { IItemService } from '../../../service/IItemService';

class FileItemController {
  private _fileUploadController: FileUploadController;
  constructor(
    private _itemService: IItemService,
    public controllerBuilder: ControllerBuilder<FileItem>,
  ) {}

  get fileUploadController() {
    if (!this._fileUploadController) {
      const itemRequestController = this.controllerBuilder.buildRequestController(
        {
          basePath: '/file',
          networkClient: Api.glipNetworkClient,
        },
      );

      const entitySourceController = this.controllerBuilder.buildEntitySourceController(
        daoManager.getDao(ItemDao),
        itemRequestController,
      );

      const partialModifyController = this.controllerBuilder.buildPartialModifyController(
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

export { FileItemController };
