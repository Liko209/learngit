/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-29 10:12:34
 * Copyright © RingCentral. All rights reserved.
 */
import Loki from 'lokijs';
import LokiCollection from './LokiCollection';
import { parseSchema } from '../utils';
import {
  DatabaseKeyType,
  IDatabase,
  IDatabaseCollection,
  ISchema,
  IParsedSchema,
} from '../../db';

class LokiDB implements IDatabase {
  db: Loki;
  private opened: boolean;
  constructor(schema: ISchema) {
    this.db = new Loki(schema.name);
    this._initSchema(schema);
    this.opened = false;
  }

  async ensureDBOpened(): Promise<void> {
    this.opened = true;
  }

  async open(): Promise<void> {
    await this.ensureDBOpened();
  }

  isOpen(): boolean {
    return this.opened;
  }

  async close(): Promise<void> {
    this.opened = false;
  }

  async delete(): Promise<void> {
    this.db.collections.forEach((col: Loki.Collection) => col.clear());
    await this.close();
  }

  getCollection<T extends object, Key extends DatabaseKeyType>(
    name: string,
  ): LokiCollection<T, Key> {
    return new LokiCollection<T, Key>(this.db, name);
  }

  async getTransaction(
    mode: string | void,
    collections: IDatabaseCollection<any, DatabaseKeyType>[] | void,
    callback: () => Promise<void>,
  ): Promise<void> {
    await callback();
  }

  private _initSchema(schema: ISchema) {
    parseSchema(
      schema.schema,
      ({ unique, indices, colName }: IParsedSchema) => {
        this.db.addCollection(colName, {
          indices,
          disableMeta: true,
          unique: [unique],
        });
      },
    );
  }
}

export default LokiDB;
