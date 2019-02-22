/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractService } from './AbstractService';
import { IdModel } from '../model';
import { container } from '../../container';
import { ISubscribeController } from '../controller/interface/ISubscribeController';
import { IEntitySourceController } from '../controller/interface/IEntitySourceController';
import { BaseDao } from '../../framework/dao';
import NetworkClient from '../../api/NetworkClient';
import {
  buildRequestController,
  buildEntityCacheController,
  buildEntityPersistentController,
  buildEntitySourceController,
  buildEntityCacheSearchController,
} from '../controller';
import { mainLogger } from 'foundation';
import { IEntityCacheController } from '../controller/interface/IEntityCacheController';
import { IEntityCacheSearchController } from '../controller/interface/IEntityCacheSearchController';

class EntityBaseService<T extends IdModel = IdModel> extends AbstractService {
  private _subscribeController: ISubscribeController;
  private _entitySourceController: IEntitySourceController<T>;
  private _entityCacheController: IEntityCacheController<T>;

  constructor(
    public isSupportedCache: boolean,
    public dao?: BaseDao<T>,
    public networkConfig?: { basePath: string; networkClient: NetworkClient },
  ) {
    super();
    this._initControllers();
  }

  getEntitySource() {
    return this._entitySourceController;
  }

  getEntityCacheSearchController(): IEntityCacheSearchController<T> {
    return buildEntityCacheSearchController<T>(this._entityCacheController);
  }

  setSubscriptionController(subscribeController: ISubscribeController) {
    this._subscribeController = subscribeController;
  }

  protected onStarted() {
    if (this._subscribeController) {
      this._subscribeController.subscribe();
    }
  }
  protected onStopped() {
    if (this._subscribeController) {
      this._subscribeController.unsubscribe();
    }
  }

  async getById(id: number): Promise<T | null> {
    if (this._entitySourceController) {
      return await this._entitySourceController.get(id);
    }
    throw new Error('entitySourceController is null');
  }

  isCacheInitialized() {
    return this.isCacheEnable() && this._entityCacheController.isInitialized();
  }

  isCacheEnable(): boolean {
    return this._entityCacheController ? true : false;
  }

  private _initControllers() {
    if (this.isSupportedCache && !this._entityCacheController) {
      this._entityCacheController = buildEntityCacheController<T>();
      this._initialEntitiesCache();
    }

    this._entitySourceController = buildEntitySourceController(
      buildEntityPersistentController<T>(this.dao, this._entityCacheController),
      this.networkConfig
        ? buildRequestController<T>(this.networkConfig)
        : undefined,
    );
  }

  private async _initialEntitiesCache() {
    mainLogger.debug('_initialEntitiesCache begin');
    if (
      this.dao &&
      this._entityCacheController &&
      !this._entityCacheController.isStartInitial()
    ) {
      const models = await this.dao.getAll();
      this._entityCacheController.initialize(models);
      mainLogger.debug('_initialEntitiesCache done');
    } else {
      mainLogger.debug(
        'initial cache without permission or already initialized',
      );
    }
  }

  static getInstance<T extends EntityBaseService<any>>(): T {
    return container.get(this.name);
  }
}

export { EntityBaseService };
