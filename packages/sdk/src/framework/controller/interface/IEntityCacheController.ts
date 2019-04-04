/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 15:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, Raw } from '../../../framework/model';
import { IEntityPersistentController } from './IEntityPersistentController';

interface IEntityCacheController<T extends IdModel = IdModel>
  extends IEntityPersistentController<T> {
  getSynchronously(key: number): T | null;

  initialize(entities: T[]): void;

  isInitialized(): boolean;

  isStartInitial(): boolean;

  getEntities(filterFunc?: (entity: T) => boolean): Promise<T[]>;

  replace(ids: number[], entities: Map<number, T>): Promise<void>;

  updateEx(
    entities: Map<number, T>,
    partials?: Map<number, Partial<Raw<T>>>,
  ): Promise<void>;

  setFilter(filterFunc: (entity: T) => boolean): void;
}

export { IEntityCacheController };
