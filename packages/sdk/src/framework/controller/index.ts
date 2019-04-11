/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { EntitySourceController } from './impl/EntitySourceController';
import { daoManager, DeactivatedDao } from '../../dao';
import { IDao } from '../../framework/dao';
import { RequestController } from './impl/RequestController';
import { PartialModifyController } from './impl/PartialModifyController';
import { IdModel } from '../model';
import NetworkClient from '../../api/NetworkClient';
import { IEntitySourceController } from './interface/IEntitySourceController';
import { IRequestController } from './interface/IRequestController';
import { EntityCacheController } from './impl/EntityCacheController';
import { IEntityCacheController } from './interface/IEntityCacheController';
import { EntityCacheSearchController } from './impl/EntityCacheSearchController';
import { IEntityPersistentController } from './interface/IEntityPersistentController';
import { EntityPersistentController } from './impl/EntityPersistentController';
import { IEntityCacheSearchController } from './interface/IEntityCacheSearchController';
import { EntityNotificationController } from './impl/EntityNotificationController';

export function buildPartialModifyController<T extends IdModel = IdModel>(
  entitySourceController: IEntitySourceController<T>,
) {
  return new PartialModifyController<T>(entitySourceController);
}

export function buildEntitySourceController<T extends IdModel = IdModel>(
  entityPersistentController: IEntityPersistentController<T>,
  requestController?: IRequestController<T>,
) {
  return new EntitySourceController<T>(
    entityPersistentController,
    daoManager.getDao(DeactivatedDao),
    requestController,
  );
}

export function buildRequestController<
  T extends IdModel = IdModel
>(networkConfig: {
  basePath: string;
  networkClient: NetworkClient;
}): IRequestController<T> {
  const requestController: IRequestController<T> = new RequestController<T>(
    networkConfig,
  );
  return requestController;
}

export function buildEntityCacheController<T extends IdModel = IdModel>() {
  return new EntityCacheController<T>() as IEntityCacheController<T>;
}

export function buildEntityCacheSearchController<T extends IdModel = IdModel>(
  entityCacheController: IEntityCacheController<T>,
) {
  const cacheSearchController: IEntityCacheSearchController<
    T
  > = new EntityCacheSearchController<T>(entityCacheController);
  return cacheSearchController;
}

export function buildEntityPersistentController<T extends IdModel = IdModel>(
  dao?: IDao<T>,
  cacheController?: IEntityCacheController<T>,
) {
  return new EntityPersistentController<T>(dao, cacheController);
}

export function buildEntityNotificationController<
  T extends IdModel = IdModel
>() {
  return new EntityNotificationController<T>();
}
