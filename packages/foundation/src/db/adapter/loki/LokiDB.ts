/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-29 10:12:34
 * Copyright © RingCentral. All rights reserved.
 */
import Loki from 'lokijs';
import LokiCollection from './LokiCollection';
import { parseSchema } from '../utils';
import {
  IDatabase,
  IDatabaseCollection,
  ISchema,
  IParsedSchema,
} from '../../db';

class LokiDB implements IDatabase {
  private db: Loki;
  private opened: boolean;
  constructor(schema: ISchema) {
    this.db = new Loki('memory.db');
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

  getCollection<T extends object>(name: string): LokiCollection<T> {
    return new LokiCollection<T>(this.db, name);
  }

  async getTransaction(
    mode: string | void,
    collections: IDatabaseCollection<any>[] | void,
    callback: () => {},
  ): Promise<void> {
    callback();
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
