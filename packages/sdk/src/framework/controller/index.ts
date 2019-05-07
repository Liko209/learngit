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
import { IdModel, ModelIdType } from '../model';
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

export function buildPartialModifyController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
>(entitySourceController: IEntitySourceController<T, IdType>) {
  return new PartialModifyController<T, IdType>(entitySourceController);
}

export function buildEntitySourceController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
>(
  entityPersistentController: IEntityPersistentController<T, IdType>,
  requestController?: IRequestController<T, IdType>,
  canSaveRemoteData?: boolean,
) {
  return new EntitySourceController<T, IdType>(
    entityPersistentController,
    daoManager.getDao(DeactivatedDao),
    requestController,
    canSaveRemoteData,
  );
}

export function buildRequestController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
>(networkConfig: {
  basePath: string;
  networkClient: NetworkClient;
}): IRequestController<T, IdType> {
  const requestController: IRequestController<
    T,
    IdType
  > = new RequestController<T, IdType>(networkConfig);
  return requestController;
}

export function buildEntityCacheController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
>() {
  return new EntityCacheController<T, IdType>() as IEntityCacheController<
    T,
    IdType
  >;
}

export function buildEntityCacheSearchController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
>(entityCacheController: IEntityCacheController<T, IdType>) {
  const cacheSearchController: IEntityCacheSearchController<
    T,
    IdType
  > = new EntityCacheSearchController<T, IdType>(entityCacheController);
  return cacheSearchController;
}

export function buildEntityPersistentController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
>(dao?: IDao<T, IdType>, cacheController?: IEntityCacheController<T, IdType>) {
  return new EntityPersistentController<T, IdType>(dao, cacheController);
}

export function buildEntityNotificationController<
  T extends IdModel<ModelIdType>
>() {
  return new EntityNotificationController<T>();
}
