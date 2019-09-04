/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractService } from './AbstractService';
import { IdModel, ModelIdType } from '../model';
import { IEntityChangeObserver } from '../controller/types';
import { ISubscribeController } from '../controller/interface/ISubscribeController';
import { IHealthModuleController } from '../controller/interface/IHealthModuleController';
import { IEntitySourceController } from '../controller/interface/IEntitySourceController';
import { BaseDao } from '../dao';
import NetworkClient from '../../api/NetworkClient';
import {
  buildRequestController,
  buildEntityCacheController,
  buildEntityPersistentController,
  buildEntitySourceController,
  buildEntityCacheSearchController,
  buildEntityNotificationController,
} from '../controller';
import { mainLogger } from 'foundation/log';
import { IEntityCacheController } from '../controller/interface/IEntityCacheController';
import { IEntityCacheSearchController } from '../controller/interface/IEntityCacheSearchController';
import { IEntityNotificationController } from '../controller/interface/IEntityNotificationController';
import { BaseSettingEntity } from '../model/setting';
import { IConfigHistory } from '../config/IConfigHistory';
import { configMigrator } from '../config';
import { Nullable, UndefinedAble, LoginInfo } from 'sdk/types';
import { ConfigChangeHistory } from '../config/types';
import { notificationCenter, SERVICE } from 'sdk/service';
import { UserConfig } from 'sdk/module/config';

class EntityBaseService<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> extends AbstractService implements IConfigHistory {
  private _subscribeController: ISubscribeController;
  private _entitySourceController: IEntitySourceController<T, IdType>;
  private _entityCacheController: IEntityCacheController<T, IdType>;
  private _checkTypeFunc: (id: IdType) => boolean;
  private _entityNotificationController: IEntityNotificationController<T>;
  private _healthModuleController: IHealthModuleController;
  constructor(
    public entityOptions: {
      isSupportedCache: boolean;
      entityName?: string;
    },
    public dao?: BaseDao<T, IdType>,
    public networkConfig?: { basePath: string; networkClient: NetworkClient },
  ) {
    super();
    configMigrator.addHistory(this);
    this._initControllers();
  }

  getUserConfig(): UndefinedAble<UserConfig> {
    return undefined;
  }

  getHistoryDetail(): Nullable<ConfigChangeHistory> {
    return null;
  }

  getEntitySource() {
    return this._entitySourceController;
  }
  setCheckTypeFunc(checkTypeFunc: (id: IdType) => boolean) {
    this._checkTypeFunc = checkTypeFunc;
  }
  async getById(id: IdType): Promise<T | null> {
    if (this._checkTypeFunc && !this._checkTypeFunc(id)) {
      mainLogger.trace('getById receive a error type of id');
      return null;
    }
    if (this._entitySourceController) {
      return await this._entitySourceController.get(id);
    }
    throw new Error('entitySourceController is null');
  }
  getEntityCacheSearchController(): IEntityCacheSearchController<T, IdType> {
    return buildEntityCacheSearchController<T, IdType>(
      this._entityCacheController,
    );
  }

  getEntityCacheController(): IEntityCacheController<T, IdType> {
    return this._entityCacheController;
  }

  setSubscriptionController(subscribeController: ISubscribeController) {
    this._subscribeController = subscribeController;
  }

  async clear() {
    await this._entitySourceController.clear();
  }

  protected onStarted() {
    notificationCenter.on(SERVICE.RC_LOGIN, this.onRCLogin.bind(this));
    notificationCenter.on(SERVICE.GLIP_LOGIN, this.onGlipLogin.bind(this));
    notificationCenter.on(SERVICE.LOGOUT, this.onLogout.bind(this));
    if (this._subscribeController) {
      this._subscribeController.subscribe();
    }
    this._healthModuleController && this._healthModuleController.init();
  }
  protected onStopped() {
    notificationCenter.off(SERVICE.RC_LOGIN, this.onRCLogin.bind(this));
    notificationCenter.off(SERVICE.GLIP_LOGIN, this.onGlipLogin.bind(this));
    notificationCenter.off(SERVICE.LOGOUT, this.onLogout.bind(this));
    if (this._subscribeController) {
      this._subscribeController.unsubscribe();
    }
    this._healthModuleController && this._healthModuleController.dispose();
    delete this._subscribeController;
    delete this._entitySourceController;
    delete this._entityCacheController;
    delete this._entityNotificationController;
  }

  protected onRCLogin() {}
  /* eslint-disable @typescript-eslint/no-unused-vars */
  protected onGlipLogin(loginInfo: LoginInfo) {}

  protected onLogout() {}

  async batchGet(ids: IdType[], order?: boolean): Promise<T[]> {
    if (this._entitySourceController) {
      return await this._entitySourceController.batchGet(ids, order);
    }

    throw new Error('entitySourceController is null');
  }

  batchGetSynchronously(ids: IdType[]): T[] {
    if (this._entityCacheController) {
      const entities: T[] = [];
      ids.forEach((id: IdType) => {
        const entity = this.getSynchronously(id);
        if (entity) {
          entities.push(entity);
        }
      });
      return entities;
    }
    return [];
  }

  getSynchronously(id: IdType): T | null {
    if (this._entityCacheController) {
      return this._entityCacheController.getSynchronously(id);
    }
    return null;
  }

  isCacheInitialized() {
    return this.isCacheEnable() && this._entityCacheController.isInitialized();
  }

  isCacheEnable(): boolean {
    return !!this._entityCacheController;
  }

  protected buildEntityCacheController() {
    return buildEntityCacheController<T, IdType>(this.entityOptions.entityName);
  }

  protected canSaveRemoteEntity(): boolean {
    return true;
  }

  protected canRequest(): boolean {
    return true;
  }

  private _canRequest = () => this.canRequest();

  private _initControllers() {
    if (this.entityOptions.isSupportedCache && !this._entityCacheController) {
      this._entityCacheController = this.buildEntityCacheController();
      this.initialEntitiesCache();
    }
    if (this.dao || this._entityCacheController) {
      this._entitySourceController = buildEntitySourceController(
        buildEntityPersistentController<T, IdType>(
          this.dao,
          this._entityCacheController,
        ),
        this.networkConfig
          ? {
              requestController: buildRequestController<T, IdType>(
                this.networkConfig,
              ),
              canSaveRemoteData: this.canSaveRemoteEntity(),
              canRequest: this._canRequest,
            }
          : undefined,
      );
    }
  }

  protected async initialEntitiesCache() {
    mainLogger.debug('_initialEntitiesCache begin');
    if (this.dao && !this._entityCacheController.isStartInitial()) {
      const models = await this.dao.getAll();
      this._entityCacheController.initialize(models);
      mainLogger.debug('_initialEntitiesCache done');
      return models;
    }
    mainLogger.debug('initial cache without permission or already initialized');
    this._entityCacheController.initialize([]);
    return [];
  }

  protected buildNotificationController() {
    return buildEntityNotificationController();
  }

  addEntityNotificationObserver(observer: IEntityChangeObserver<T>) {
    this.getEntityNotificationController().addObserver(observer);
  }

  removeEntityNotificationObserver(observer: IEntityChangeObserver<T>) {
    this.getEntityNotificationController().removeObserver(observer);
  }

  protected getEntityNotificationController() {
    if (!this._entityNotificationController) {
      this._entityNotificationController = this.buildNotificationController();
    }
    return this._entityNotificationController;
  }

  async getSettingsByParentId(): Promise<BaseSettingEntity[]> {
    return [];
  }

  async getSettingItemById(): Promise<BaseSettingEntity | undefined> {
    return undefined;
  }

  setHealthModuleController(controller: IHealthModuleController) {
    this._healthModuleController = controller;
  }
}

export { EntityBaseService };
