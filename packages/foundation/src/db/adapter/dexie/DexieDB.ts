/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-18 00:07:07
 * Copyright © RingCentral. All rights reserved.
 */
import Dexie, { TransactionMode } from 'dexie';
import DexieCollection from './DexieCollection';
import {
  ITableSchemaDefinition,
  ISchemaDefinition,
  DatabaseKeyType,
  IDatabase,
  IDatabaseCollection,
  ISchema,
  ISchemaVersions,
} from '../../db';

class DexieDB implements IDatabase {
  db: Dexie;
  constructor(schema: ISchema) {
    const { name } = schema;
    this.db = new Dexie(name);
    this._initSchema(schema);
  }

  async ensureDBOpened(): Promise<void> {
    if (!this.db.isOpen()) {
      await this.db.open();
    }
  }

  async open(): Promise<void> {
    await this.ensureDBOpened();
  }

  isOpen(): boolean {
    return this.db.isOpen();
  }

  async close(): Promise<void> {
    if (this.isOpen()) {
      await this.db.close();
    }
  }

  async delete(): Promise<void> {
    await this.db.delete();
  }

  getCollection<T, Key extends DatabaseKeyType>(
    name: string,
  ): DexieCollection<T, Key> {
    return new DexieCollection<T, Key>(this.db, name);
  }

  async getTransaction(
    mode: string | void,
    collections: IDatabaseCollection<any, DatabaseKeyType>[] | void,
    callback: () => Promise<void>,
  ): Promise<void> {
    if (mode && collections && Array.isArray(collections)) {
      const tables = collections.map(
        (c: IDatabaseCollection<any, DatabaseKeyType>) =>
          (c as DexieCollection<any, DatabaseKeyType>).getTable(),
      );
      await this.db.transaction(mode as TransactionMode, tables, callback);
    } else {
      await callback();
    }
  }

  private _initSchema(schema: ISchema) {
    const versions: ISchemaVersions = schema.schema;
    Object.keys(versions).forEach(version => {
      const sch: ISchemaDefinition = versions[version];
      const dexieSchema = {};
      const callbacks = {};
      Object.keys(sch).forEach(tb => {
        const { unique, indices = [], onUpgrade }: ITableSchemaDefinition = sch[
          tb
        ];
        const def = `${unique}${
          indices.length ? `, ${indices.join(', ')}` : ''
        }`;
        dexieSchema[tb] = def;
        if (onUpgrade) {
          callbacks[tb] = onUpgrade;
        }
      });
      const v = this.db.version(Number(version)).stores(dexieSchema);
      if (Object.keys(callbacks).length) {
        v.upgrade(tx =>
          Promise.all(
            Object.entries(callbacks).map(
              ([tb, onUpgrade]: [string, (item: any) => void]) =>
                tx
                  .table(tb)
                  .toCollection()
                  .modify((item: any) => onUpgrade(item)),
            ),
          ),
        );
      }
    });
  }
}

export default DexieDB;
