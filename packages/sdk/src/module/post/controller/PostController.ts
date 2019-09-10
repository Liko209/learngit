/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */
import { Post } from '../entity';
import { Api } from '../../../api';
import { PostActionController } from './implementation/PostActionController';
import {
  buildRequestController,
  buildEntityPersistentController,
  buildEntitySourceController,
  buildPartialModifyController,
} from '../../../framework/controller';
import { daoManager } from '../../../dao';
import { PostDao, PostDiscontinuousDao } from '../dao';
import { SendPostController } from './implementation/SendPostController';
import { PreInsertController } from '../../common/controller/impl/PreInsertController';
import { ProgressService } from '../../progress';
import { PostFetchController } from './PostFetchController';
import { DiscontinuousPostController } from './DiscontinuousPostController';
import { IPreInsertController } from '../../common/controller/interface/IPreInsertController';
import { ISendPostController } from './interface/ISendPostController';
import { PostDataController } from './PostDataController';
import { ENTITY } from '../../../service/eventKey';
import { PostSearchManagerController } from './implementation/PostSearchManagerController';
import { IGroupService } from '../../group/service/IGroupService';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { PostItemController } from './implementation/PostItemController';
import { IGroupConfigService } from 'sdk/module/groupConfig';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';

class PostController {
  private _actionController: PostActionController;
  private _sendController: ISendPostController;
  private _preInsertController: IPreInsertController;
  private _postFetchController: PostFetchController;
  private _discontinuousPostController: DiscontinuousPostController;
  private _postDataController: PostDataController;
  private _postSearchController: PostSearchManagerController;
  private _postItemController: PostItemController;
  constructor(
    private _groupService: IGroupService,
    private _groupConfigService: IGroupConfigService,
    private _entitySourceController: IEntitySourceController<Post, number>,
  ) {}

  getPostActionController(): PostActionController {
    if (!this._actionController) {
      const requestController = buildRequestController<Post>({
        basePath: '/post',
        networkClient: Api.glipNetworkClient,
      });

      const partialModifyController = buildPartialModifyController<Post>(
        this._entitySourceController,
      );

      this._actionController = new PostActionController(
        this.getPostDataController(),
        partialModifyController,
        requestController,
        this._entitySourceController,
      );
    }
    return this._actionController;
  }

  getSendPostController(): ISendPostController {
    if (!this._sendController) {
      this._sendController = new SendPostController(
        this.getPostActionController(),
        this._getPreInsertController(),
        this.getPostDataController(),
        this._groupService,
        this._entitySourceController,
      );
    }
    return this._sendController;
  }

  getPostFetchController() {
    if (!this._postFetchController) {
      const persistentController = buildEntityPersistentController<Post>(
        daoManager.getDao(PostDao),
      );
      const entitySourceController = buildEntitySourceController<Post>(
        persistentController,
      );

      this._postFetchController = new PostFetchController(
        this._groupService,
        this.getPostDataController(),
        entitySourceController,
      );
    }
    return this._postFetchController;
  }

  getDiscontinuousPostFetchController() {
    if (!this._discontinuousPostController) {
      const persistentController = buildEntityPersistentController<Post>(
        daoManager.getDao(PostDiscontinuousDao),
      );
      const entitySourceController = buildEntitySourceController<Post>(
        persistentController,
      );

      this._discontinuousPostController = new DiscontinuousPostController(
        entitySourceController,
      );
    }
    return this._discontinuousPostController;
  }

  getPostDataController() {
    if (!this._postDataController) {
      const persistentController = buildEntityPersistentController<Post>(
        daoManager.getDao(PostDao),
      );
      const entitySourceController = buildEntitySourceController<Post>(
        persistentController,
      );

      this._postDataController = new PostDataController(
        this._groupService,
        this._groupConfigService,
        this._getPreInsertController(),
        entitySourceController,
      );
    }
    return this._postDataController;
  }

  getPostSearchController() {
    if (!this._postSearchController) {
      this._postSearchController = new PostSearchManagerController();
    }

    return this._postSearchController;
  }

  getPostItemController() {
    if (!this._postItemController) {
      this._postItemController = new PostItemController(
        this.getPostActionController(),
      );
    }
    return this._postItemController;
  }

  private _getPreInsertController() {
    if (!this._preInsertController) {
      const progressService = ServiceLoader.getInstance<ProgressService>(
        ServiceConfig.PROGRESS_SERVICE,
      );
      this._preInsertController = new PreInsertController<Post>(
        daoManager.getDao(PostDao),
        progressService,
        (entity: Post) => `${ENTITY.POST}.${entity.group_id}`,
      );
    }
    return this._preInsertController;
  }

}

export { PostController };
