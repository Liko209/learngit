/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 14:08:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../model';
import { BaseDao } from '../../../dao/base';
import NetworkClient from '../../../api/NetworkClient';
import { IEntitySourceController } from './IEntitySourceController';
import { IRequestController } from './IRequestController';
import { IPartialModifyController } from './IPartialModifyController';
import { IEntityCacheController } from './IEntityCacheController';
import { IEntityCacheSearchController } from './IEntityCacheSearchController';
import { ISubscribeController } from './ISubscribeController';

interface IControllerBuilder<T extends IdModel = IdModel> {
  buildEntitySourceController(
    dao: BaseDao<T>,
    requestController: IRequestController<T>,
  ): IEntitySourceController<T>;

  buildRequestController(networkConfig: {
    basePath: string;
    networkClient: NetworkClient;
  }): IRequestController<T>;

  buildPartialModifyController(
    entitySourceController: IEntitySourceController<T>,
  ): IPartialModifyController<T>;

  buildEntityCacheController(): IEntityCacheController<T>;

  buildEntityCacheSearchController(
    entityCacheController: IEntityCacheController,
  ): IEntityCacheSearchController;

  buildSubscriptionController(subscriptions: Object): ISubscribeController;
}

export { IControllerBuilder };
