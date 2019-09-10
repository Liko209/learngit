/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, ModelIdType } from '../../model';
import { IEntityPersistentController } from './IEntityPersistentController';
import { IRequestController } from './IRequestController';

interface IEntitySourceController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> extends IEntityPersistentController<T, IdType> {
  getEntityLocally(id: IdType): Promise<T | null>;

  getEntitiesLocally(ids: IdType[], includeDeactivated: boolean): Promise<T[]>;

  getEntities(
    filterFunc?: (entity: T) => boolean,
    sortFunc?: (entityA: T, entityB: T) => number,
  ): Promise<T[]>;

  getRequestController(): IRequestController<T, IdType> | null;
}

export { IEntitySourceController };
