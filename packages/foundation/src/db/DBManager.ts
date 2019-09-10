/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-27 23:10:56
 * Copyright © RingCentral. All rights reserved.
 */
import { DexieDB, LokiDB } from './adapter';
import { DatabaseType } from './enums';
import { ISchema, IDatabase } from './db';

class DBManager {
  private db!: IDatabase;
  initDatabase(schema: ISchema, type?: DatabaseType): void {
    switch (type) {
      case DatabaseType.LokiDB:
        this.db = new LokiDB(schema);
        break;

      case DatabaseType.DexieDB:
      default:
        this.db = new DexieDB(schema);
        break;
    }
  }

  async openDatabase(): Promise<void> {
    this.db && (await this.db.open());
  }

  async closeDatabase(): Promise<void> {
    this.db && (await this.db.close());
  }

  async deleteDatabase(): Promise<void> {
    this.db && (await this.db.delete());
  }

  isDatabaseOpen(): boolean {
    return this.db && this.db.isOpen();
  }

  getDatabase(): IDatabase {
    return this.db;
  }
}

export default DBManager;
