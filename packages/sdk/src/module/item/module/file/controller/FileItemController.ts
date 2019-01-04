/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-03 13:54:21
 * Copyright © RingCentral. All rights reserved.
 */
import { IControllerBuilder } from '../../../../../framework/controller/interface/IControllerBuilder';
import { ItemFile } from '../../../entity';
import { FileUploadController } from '../controller/FileUploadController';
import { Api } from '../../../../../api';
import { daoManager, ItemDao } from '../../../../../dao';
class FileItemController {
  private _fileUploadController: FileUploadController;
  constructor(public controllerBuilder: IControllerBuilder<ItemFile>) {}

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
        partialModifyController,
        itemRequestController,
      );
    }

    return this._fileUploadController;
  }
}

export { FileItemController };
