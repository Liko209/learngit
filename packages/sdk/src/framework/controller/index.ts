/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { EntitySourceController } from './impl/EntitySourceController';
import { daoManager, BaseDao, DeactivatedDao } from '../../dao';
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
  const request: IRequestController<T> = new RequestController<T>(
    networkConfig,
  );
  return request;
}

export function buildEntityCacheController<T extends IdModel = IdModel>() {
  return new EntityCacheController<T>();
}

export function buildEntityCacheSearchController<T extends IdModel = IdModel>(
  entityCacheController: IEntityCacheController<T>,
) {
  return new EntityCacheSearchController<T>(entityCacheController);
}

export function buildEntityPersistentController<T extends IdModel = IdModel>(
  dao?: BaseDao<T>,
  cacheController?: IEntityPersistentController<T>,
) {
  return new EntityPersistentController<T>(dao, cacheController);
}
