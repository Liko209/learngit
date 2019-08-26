/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 15:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, Raw, ModelIdType } from '../../model';
import { IEntityPersistentController } from './IEntityPersistentController';

interface IEntityCacheController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> extends IEntityPersistentController<T, IdType> {
  getSynchronously(key: IdType): T | null;

  initialize(entities: T[]): void;

  isInitialized(): boolean;

  isStartInitial(): boolean;

  getEntities(
    filterFunc?: (entity: T) => boolean,
    sortFunc?: (entityA: T, entityB: T) => number,
  ): Promise<T[]>;

  replace(ids: IdType[], entities: Map<IdType, T>): Promise<void>;

  updateEx(
    entities: Map<IdType, T>,
    partials?: Map<IdType, Partial<Raw<T>>>,
  ): Promise<void>;
}

export { IEntityCacheController };
