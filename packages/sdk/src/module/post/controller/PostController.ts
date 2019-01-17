/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */
import { Post } from '../entity';
import _ from 'lodash';
import { Api } from '../../../api';
import { PostActionController } from './implementation/PostActionController';
import { IControllerBuilder } from '../../../framework/controller/interface/IControllerBuilder';
import { daoManager, PostDao } from '../../../dao';
import { SendPostController } from './implementation/SendPostController';
import { PreInsertController } from '../../common/controller/impl/PreInsertController';

class PostController {
  private _actionController: PostActionController;
  private _sendController: SendPostController;
  private _preInsertController: PreInsertController;

  constructor(public controllerBuilder: IControllerBuilder<Post>) {}

  getPostActionController(): PostActionController {
    if (!this._actionController) {
      const requestController = this.controllerBuilder.buildRequestController({
        basePath: '/post',
        networkClient: Api.glipNetworkClient,
      });

      const entitySourceController = this.controllerBuilder.buildEntitySourceController(
        daoManager.getDao(PostDao),
        requestController,
      );

      const partialModifyController = this.controllerBuilder.buildPartialModifyController(
        entitySourceController,
      );

      this._actionController = new PostActionController(
        partialModifyController,
        requestController,
        this._getPreInsertController(),
      );
    }
    return this._actionController;
  }
  getSendPostController(): SendPostController {
    if (!this._sendController) {
      this._sendController = new SendPostController(
        this.getPostActionController(),
        this._getPreInsertController(),
      );
    }
    return this._sendController;
  }

  private _getPreInsertController() {
    if (!this._preInsertController) {
      this._preInsertController = new PreInsertController<Post>(
        daoManager.getDao(PostDao),
      );
    }
    return this._preInsertController;
  }
}

export { PostController };
