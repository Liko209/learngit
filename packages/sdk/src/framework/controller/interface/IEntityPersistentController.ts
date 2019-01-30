/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-17 15:05:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../model';

interface IEntityPersistentController<T extends IdModel = IdModel> {
  put(item: T | T[]): Promise<void>;

  bulkPut(array: T[]): Promise<void>;

  clear(): Promise<void>;

  delete(key: number): Promise<void>;

  bulkDelete(keys: number[]): Promise<void>;

  update(item: Partial<T> | Partial<T>[]): Promise<void>;

  bulkUpdate(array: Partial<T>[]): Promise<void>;

  get(key: number): Promise<T | null>;

  batchGet(ids: number[]): Promise<T[]>;

  getEntityNotificationKey(): string;

  getEntities(filterFunc?: (entity: T) => boolean): Promise<T[]>;
}

export { IEntityPersistentController };
