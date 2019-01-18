/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */
import { Post } from '../entity';
import _ from 'lodash';
import { Api } from '../../../api';
import { PostActionController } from './implementation/PostActionController';
import {
  buildRequestController,
  buildEntityPersistentController,
  buildEntitySourceController,
  buildPartialModifyController,
} from '../../../framework/controller';
import { daoManager, PostDao } from '../../../dao';
import { SendPostController } from './implementation/SendPostController';
import { PreInsertController } from '../../common/controller/impl/PreInsertController';
import { ProgressService } from '../../progress';
import { PostFetchController } from './PostFetchController';

class PostController {
  private _actionController: PostActionController;
  private _sendController: SendPostController;
  private _preInsertController: PreInsertController;
  private _fetchController: PostFetchController;

  constructor() {}

  getPostActionController(): PostActionController {
    if (!this._actionController) {
      const requestController = buildRequestController<Post>({
        basePath: '/post',
        networkClient: Api.glipNetworkClient,
      });

      const persistentController = buildEntityPersistentController<Post>(
        daoManager.getDao(PostDao),
      );
      const entitySourceController = buildEntitySourceController<Post>(
        persistentController,
        requestController,
      );

      const partialModifyController = buildPartialModifyController<Post>(
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

  getPostFetchController() {
    if (!this._fetchController) {
      this._fetchController = new PostFetchController();
    }
  }

  private _getPreInsertController() {
    if (!this._preInsertController) {
      const progressService: ProgressService = ProgressService.getInstance();
      this._preInsertController = new PreInsertController<Post>(
        daoManager.getDao(PostDao),
        progressService,
      );
    }
    return this._preInsertController;
  }
}

export { PostController };
