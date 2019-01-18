/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { EntitySourceController } from './EntitySourceController';
import { daoManager, BaseDao, DeactivatedDao } from '../../../dao';
import { RequestController } from './RequestController';
import { PartialModifyController } from './PartialModifyController';
import { IdModel } from '../../model';
import NetworkClient from '../../../api/NetworkClient';
import { IControllerBuilder } from '../interface/IControllerBuilder';
import { IEntitySourceController } from '../interface/IEntitySourceController';
import { IRequestController } from '../interface/IRequestController';
import { EntityCacheController } from './EntityCacheController';
import { IEntityCacheController } from '../interface/IEntityCacheController';
import { EntityCacheSearchController } from './EntityCacheSearchController';

class ControllerBuilder<T extends IdModel = IdModel>
  implements IControllerBuilder<T> {
  constructor() {}
  buildEntitySourceController(
    dao: BaseDao<T>,
    requestController?: IRequestController<T>,
  ) {
    return new EntitySourceController<T>(
      dao,
      daoManager.getDao(DeactivatedDao),
      requestController,
    );
  }

  buildRequestController(networkConfig: {
    basePath: string;
    networkClient: NetworkClient;
  }) {
    return new RequestController<T>(networkConfig);
  }

  buildPartialModifyController(
    entitySourceController: IEntitySourceController<T>,
  ) {
    return new PartialModifyController<T>(entitySourceController);
  }

  buildEntityCacheController() {
    return new EntityCacheController<T>();
  }

  buildEntityCacheSearchController(
    entityCacheController: IEntityCacheController,
  ) {
    return new EntityCacheSearchController(entityCacheController);
  }

  static getControllerBuilder<T extends IdModel = IdModel>() {
    return new ControllerBuilder<T>();
  }
}
export { ControllerBuilder };
