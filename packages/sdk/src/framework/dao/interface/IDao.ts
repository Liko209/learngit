/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-17 15:05:00
 * Copyright © RingCentral. All rights reserved.
 */

interface IDao<T> {
  put(item: T | T[]): Promise<void>;

  bulkPut(array: T[]): Promise<void>;

  clear(): Promise<void>;

  delete(key: number): Promise<void>;

  bulkDelete(keys: number[]): Promise<void>;

  update(item: Partial<T> | Partial<T>[], shouldDoPut?: boolean): Promise<void>;

  bulkUpdate(array: Partial<T>[], shouldDoPut?: boolean): Promise<void>;

  get(key: number): Promise<T | null>;

  batchGet(ids: number[], order?: boolean): Promise<T[]>;

  getAll(): Promise<T[]>;

  getTotalCount(): Promise<number>;

  getEntityName(): string;
}

export { IDao };
