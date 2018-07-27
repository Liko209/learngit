/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-27 23:10:56
 */
import { DexieDB, LokiDB } from './adapter';
import { DatabaseType } from './enums';
import { ISchema } from './../db';
class DBManager {
  private db!: DexieDB | LokiDB;
  initDatabase(schema: ISchema, type?: DatabaseType): void {
    switch (type) {
      default:
      case DatabaseType.DexieDB:
        this.db = new DexieDB(schema);
        break;
      case DatabaseType.LokiDB:
        this.db = new LokiDB(schema);
        break;
    }
  }

  async openDatabase(): Promise<void> {
    await this.db.open();
  }

  async closeDatabase(): Promise<void> {
    await this.db.close();
  }

  async deleteDatabase(): Promise<void> {
    await this.db.delete();
  }

  isDatabaseOpen(): boolean {
    return this.db && this.db.isOpen();
  }

  getDatabase(): DexieDB | LokiDB {
    return this.db;
  }
}

export default DBManager;
