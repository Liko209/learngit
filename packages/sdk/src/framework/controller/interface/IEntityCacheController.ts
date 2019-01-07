/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 15:16:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, Raw } from '../../../framework/model';

interface IEntityCacheController<T extends IdModel = IdModel> {
  initialize(entities: T[]): void;

  isInitialized(): boolean;

  isStartInitial(): boolean;

  getEntities(filterFunc?: (entity: T) => boolean): Promise<T[]>;

  getMultiEntities(ids: number[]): Promise<T[]>;

  getEntity(id: number): T | null;

  set(entity: T): void;

  clear(): void;

  replace(ids: number[], entities: Map<number, T>): Promise<void>;

  update(
    entities: Map<number, T>,
    partials?: Map<number, Partial<Raw<T>>>,
  ): Promise<void>;

  delete(ids: number[]): Promise<void>;
}

export { IEntityCacheController };
