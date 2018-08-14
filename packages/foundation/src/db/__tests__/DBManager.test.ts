/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-27 23:22:15
 * @Last Modified by: Chris Zhan (chris.zhan@ringcentral.com)
 * @Last Modified time: 2018-08-09 14:43:50
 */
/// <reference path="../../__tests__/types.d.ts" />

import { ISchema } from '../db';
import DBManager from '../DBManager';
import DexieDB from '../adapter/dexie/DexieDB';
import { DatabaseType } from '../enums';

jest.mock('../adapter/dexie/DexieDB');

const schema: ISchema = {
  name: 'Glip',
  version: 1,
  schema: {
    1: {
      person: {
        unique: 'id',
      },
    },
  },
};

describe('DBManager', () => {
  let initedDBManager: DBManager;

  beforeEach(() => {
    jest.clearAllMocks();
    initedDBManager = new DBManager();
    initedDBManager.initDatabase(schema);
  });

  describe('getDatabase()', () => {
    it('should return database instance', async () => {
      expect(initedDBManager.getDatabase()).toBeInstanceOf(DexieDB);
    });
  });

  describe('initDatabase()', () => {
    it('should init a dexie database', () => {
      const dbManager = new DBManager();
      dbManager.initDatabase(schema, DatabaseType.DexieDB);
      expect(dbManager.getDatabase()).toBeInstanceOf(DexieDB);
    });
  });

  describe('isDatabaseOpen()', () => {
    it('should return status of database', async () => {
      DexieDB.mock.instances[0].isOpen.mockReturnValue(true);
      expect(initedDBManager.isDatabaseOpen()).toBeTruthy();
    });
  });

  describe('openDataBase()', () => {
    it('should open database', async () => {
      await initedDBManager.openDatabase();
      expect(DexieDB.mock.instances[0].open).toHaveBeenCalled();
    });
  });

  describe('closeDatabase()', () => {
    it('should close database', async () => {
      await initedDBManager.closeDatabase();
      expect(DexieDB.mock.instances[0].close).toHaveBeenCalled();
    });
  });

  describe('deleteDatabase()', () => {
    it('should delete database', async () => {
      await initedDBManager.deleteDatabase();
      expect(DexieDB.mock.instances[0].delete).toHaveBeenCalled();
    });
  });
});
