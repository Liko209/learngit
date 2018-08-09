/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-27 23:10:56
 */
import { DexieDB } from './adapter';
import { DatabaseType } from './enums';
import { ISchema } from './../db';
class DBManager {
  private db!: DexieDB;
  initDatabase(schema: ISchema, type?: DatabaseType): void {
    this.db = new DexieDB(schema);
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

  getDatabase(): DexieDB {
    return this.db;
  }
}

export default DBManager;
