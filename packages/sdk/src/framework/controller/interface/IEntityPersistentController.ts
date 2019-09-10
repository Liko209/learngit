/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-17 15:05:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, ModelIdType } from '../../model';
import { IDao } from '../../dao';

interface IEntityPersistentController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> extends IDao<T, IdType> {
  getEntityNotificationKey(): string;

  getEntities(
    filterFunc?: (entity: T) => boolean,
    sortFunc?: (entityA: T, entityB: T) => number,
  ): Promise<T[]>;

  saveToMemory?: (entities: T[]) => void;
}

export { IEntityPersistentController };
