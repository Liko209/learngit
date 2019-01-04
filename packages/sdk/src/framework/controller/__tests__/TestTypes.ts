/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-19 14:06:00
 * Copyright © RingCentral. All rights reserved.
 */
import { IdModel } from '../../../framework/model';
import { IDatabaseCollection, IDatabase } from 'foundation/src/db';

export type TestEntity = IdModel & {
  name: string;
  note?: string;
};

export class TestDatabase implements IDatabase {
  async ensureDBOpened() {}

  async open() {}

  isOpen() {
    return true;
  }

  close() {}
  async delete() {}
  getCollection<T extends object>(name: string) {
    return null;
  }

  async getTransaction(
    mode: string | void,
    collections: IDatabaseCollection<any>[] | void,
    callback: () => {},
  ) {}
}
