/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-28 00:26:24
 */
// / <reference path="../../__tests__/types.d.ts" />
import {
  KVStorage,
  DBManager,
  DexieDB,
  IDatabase,
  LokiDB,
  DatabaseType,
} from 'foundation/db';
import { mainLogger } from 'foundation/log';
import DaoManager from '../DaoManager';
import { BaseDao, BaseKVDao } from 'sdk/framework/dao';
import Loki from 'lokijs';
import { IdModel } from 'sdk/framework/model';
import { DaoGlobalConfig } from '../config';
import { AccountGlobalConfig } from 'sdk/module/account/config';
import { SyncUserConfig } from 'sdk/module/sync/config/SyncUserConfig';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import Dexie from 'dexie';
import schema from '../schema';

jest.mock('sdk/module/env/index');

// Using manual mock to improve mock priority.
// jest.mock('foundation/F', () => jest.genMockFromModule<any>('foundation'));
jest.mock('foundation/db');
jest.mock('sdk/framework/dao');
jest.mock('../schema', () => ({
  name: 'DB',
  version: 1,
  schema: {
    1: {
      mock: {
        unique: 'id',
        indices: [
          'index',
          'name',
          'pet',
          '[index+name]',
          '[name+index]',
          '[id+index]',
          '[index+id]',
          '*teams',
        ],
      },
    },
  },
}));
jest.mock('../../module/config');
jest.mock('../../module/account/config/AccountGlobalConfig');
jest.mock('../../module/sync/config/SyncUserConfig');

class TestKVDao extends BaseKVDao {
  static COLLECTION_NAME = 'TestKVDao';

  constructor(db: KVStorage) {
    super(TestKVDao.COLLECTION_NAME, db, ['key_1a', 'key_1b']);
  }
}

class TestDao extends BaseDao<IdModel> {
  static COLLECTION_NAME = 'TestDao';

  constructor(db: IDatabase) {
    super(TestDao.COLLECTION_NAME, db);
  }
}

describe('DaoManager', () => {
  let daoManager: DaoManager;

  beforeEach(() => {
    jest.clearAllMocks();
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.SYNC_SERVICE) {
          return { userConfig: SyncUserConfig.prototype };
        }
      });
    daoManager = new DaoManager();
    mainLogger.tags = jest.fn().mockReturnValue({ info: jest.fn() });
  });

  describe('initDataBase()', () => {
    it('should init database', async () => {
      const clearFunc = jest.fn();
      DaoGlobalConfig.getDBSchemaVersion = jest.fn().mockReturnValueOnce(1);
      await daoManager.initDatabase(clearFunc);
      expect(DBManager.mock.instances[0].initDatabase).toHaveBeenCalled();
      expect(clearFunc).not.toHaveBeenCalled();
    });

    describe('db upgrade', () => {
      it('should not delete old db if version is same', async () => {
        const clearFunc = jest.fn();
        DaoGlobalConfig.getDBSchemaVersion = jest.fn().mockReturnValueOnce(1);
        await daoManager.initDatabase(clearFunc);
        expect(clearFunc).not.toHaveBeenCalled();
      });

      it('should delete old db if version is deprecated', async () => {
        const clearFunc = jest.fn();
        DaoGlobalConfig.getDBSchemaVersion = jest.fn().mockReturnValueOnce(0);
        AccountGlobalConfig.getUserDictionary.mockReturnValue('123');
        await daoManager.initDatabase(clearFunc);
        expect(clearFunc).toHaveBeenCalled();
      });

      it('should delete old db if local version is not found', async () => {
        const clearFunc = jest.fn();
        DaoGlobalConfig.getDBSchemaVersion = jest
          .fn()
          .mockReturnValueOnce(null);
        await daoManager.initDatabase(clearFunc);
        expect(clearFunc).toHaveBeenCalled();
      });

      it('should not call db.on when db type is lokiDB', async () => {
        const clearFunc = jest.fn();
        const db = new LokiDB({
          name: 'db',
          version: 1,
          schema: {},
        });
        db.db = new Loki('');
        jest.spyOn(db.db, 'on');
        DBManager.mock.instances[0].getDatabaseType = jest
          .fn()
          .mockReturnValue(DatabaseType.LokiDB);
        DBManager.mock.instances[0].getDatabase.mockReturnValue(db);
        await daoManager.initDatabase(clearFunc);
        expect(db.db.on).not.toHaveBeenCalled();
        expect(clearFunc).toHaveBeenCalled();
      });

      it('should set callback and call db.on when db dexiDB', async () => {
        const clearFunc = jest.fn();
        const db = new DexieDB({
          name: 'db',
          version: 1,
          schema: {},
        });
        db.db = new Dexie('');
        jest.spyOn(db.db, 'on');
        DBManager.mock.instances[0].getDatabase.mockReturnValue(db);
        await daoManager.initDatabase(clearFunc);
        expect(db.db.on).toHaveBeenCalled();
        expect(clearFunc).toHaveBeenCalled();
      });
    });
  });

  describe('openDatabase()', () => {
    it('should open database', async () => {
      await daoManager.openDatabase();
      expect(DBManager.mock.instances[0].openDatabase).toHaveBeenCalled();
    });
  });

  describe('closeDatabase()', () => {
    it('should close database', async () => {
      await daoManager.closeDatabase();
      expect(DBManager.mock.instances[0].closeDatabase).toHaveBeenCalled();
    });
  });

  describe('deleteDatabase()', () => {
    it('should delete database', async () => {
      await daoManager.deleteDatabase();
      expect(DBManager.mock.instances[0].deleteDatabase).toHaveBeenCalled();
    });

    it('should delete lokiDB when deleting database failed', async () => {
      daoManager['dbManager'].deleteDatabase = jest.fn().mockImplementationOnce(() => {
        throw 'error';
      });
      daoManager['dbManager'].initDatabase = jest.fn();
      await daoManager.deleteDatabase();
      expect(daoManager['dbManager'].initDatabase).toBeCalledWith(schema, DatabaseType.LokiDB);
      expect(daoManager['dbManager'].deleteDatabase).toHaveBeenCalledTimes(2);
    });
  });

  describe('isDatabaseOpen()', () => {
    it('should return status of database', () => {
      DBManager.mock.instances[0].isDatabaseOpen.mockReturnValue(true);
      expect(daoManager.isDatabaseOpen()).toBeTruthy();

      DBManager.mock.instances[0].isDatabaseOpen.mockReturnValue(false);
      expect(daoManager.isDatabaseOpen()).toBeFalsy();
    });
  });

  describe('getDao()', () => {
    it('should return the same dao instance for a dao class', () => {
      expect(daoManager.getKVDao(TestKVDao)).toBe(
        daoManager.getKVDao(TestKVDao),
      );
      expect(daoManager.getDao(TestDao)).toBe(daoManager.getDao(TestDao));
    });
  });
});
