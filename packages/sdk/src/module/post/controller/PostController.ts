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
import { IPreInsertController } from '../../common/controller/interface/IPreInsertController';
import { PostDaoController } from './PostDaoController';

class PostController {
  private _actionController: PostActionController;
  private _sendController: SendPostController;
  private _preInsertController: IPreInsertController;
  private _fetchController: PostFetchController;
  private _daoController: PostDaoController;

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
      const persistentController = buildEntityPersistentController<Post>(
        daoManager.getDao(PostDao),
      );
      const entitySourceController = buildEntitySourceController<Post>(
        persistentController,
      );

      this._fetchController = new PostFetchController(
        this._getPreInsertController(),
        entitySourceController,
      );
    }
    return this._fetchController;
  }

  getPostDaoController() {
    if (!this._daoController) {
      this._daoController = new PostDaoController();
    }
    return this._daoController;
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
