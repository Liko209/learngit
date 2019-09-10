/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-17 15:05:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, ModelIdType } from '../../model';

interface IDao<T extends IdModel<IdType>, IdType extends ModelIdType = number> {
  put(item: T): Promise<void>;

  bulkPut(array: T[]): Promise<void>;

  clear(): Promise<void>;

  delete(key: IdType): Promise<void>;

  bulkDelete(keys: IdType[]): Promise<void>;

  update(item: Partial<T>, shouldDoPut?: boolean): Promise<void>;

  bulkUpdate(array: Partial<T>[], shouldDoPut?: boolean): Promise<void>;

  get(key: IdType): Promise<T | null>;

  batchGet(ids: IdType[], order?: boolean): Promise<T[]>;

  getAll(): Promise<T[]>;

  getTotalCount(): Promise<number>;

  getEntityName(): string;
}

export { IDao };
