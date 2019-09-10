/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:18:36
 * Copyright © RingCentral. All rights reserved.
 */
export interface IStore<T extends object, Id extends number | string = number> {
  create(item: Partial<T>): T | undefined;
  delete(id: Id): void;
  update(item: Partial<T>): void;
  getById(id: Id): T | null;
  getByIds(ids: Id[]): (T | undefined)[];
  getItems(options: { limit: number; direction: string }): T[];
}
