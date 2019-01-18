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
import { BaseDao } from '../../dao';
import NetworkClient from '../../api/NetworkClient';
import {
  buildRequestController,
  buildEntityCacheController,
  buildEntityPersistentController,
  buildEntitySourceController,
} from '../controller';

class EntityBaseService<T extends IdModel = IdModel> extends AbstractService {
  private _subscribeController: ISubscribeController;
  private _entitySourceController: IEntitySourceController<T>;
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

  getById(id: number): Promise<T | null> {
    if (this._entitySourceController) {
      return Promise.resolve(this._entitySourceController.get(id));
    }
    throw new Error('entitySourceController is null');
  }

  private _initControllers() {
    this._entitySourceController = buildEntitySourceController(
      buildEntityPersistentController<T>(
        this.dao,
        this.isSupportedCache ? buildEntityCacheController<T>() : undefined,
      ),
      this.networkConfig
        ? buildRequestController<T>(this.networkConfig)
        : undefined,
    );
  }

  static getInstance<T extends EntityBaseService<any>>(): T {
    return container.get(this.name);
  }
}

export { EntityBaseService };
