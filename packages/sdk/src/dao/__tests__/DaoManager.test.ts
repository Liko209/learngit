/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-28 00:26:24
 */
/// <reference path="../../__tests__/types.d.ts" />
import { KVStorage, DBManager, DexieDB, IDatabase } from 'foundation';
import DaoManager from '../DaoManager';
import { BaseDao, BaseKVDao } from '../../framework/dao';
import Dexie from 'dexie';
import { IdModel } from '../../framework/model';
import { DaoGlobalConfig } from '../config';
import { AccountGlobalConfig } from '../../module/account/config';
import { SyncUserConfig } from '../../module/sync/config';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

jest.mock('../../module/env/index');

// Using manual mock to improve mock priority.
jest.mock('foundation', () => jest.genMockFromModule<any>('foundation'));
jest.mock('../../framework/dao');
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
jest.mock('../../module/sync/config');

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
  });

  describe('initDataBase()', () => {
    it('should init database', async () => {
      DaoGlobalConfig.getDBSchemaVersion = jest.fn().mockReturnValueOnce(1);
      await daoManager.initDatabase();
      expect(DBManager.mock.instances[0].initDatabase).toHaveBeenCalled();
    });

    describe('db upgrade', () => {
      it('should not delete old db if version is same', async () => {
        DaoGlobalConfig.getDBSchemaVersion = jest.fn().mockReturnValueOnce(1);
        await daoManager.initDatabase();
        expect(
          DBManager.mock.instances[0].deleteDatabase,
        ).not.toHaveBeenCalled();
        expect(
          SyncUserConfig.prototype.removeLastIndexTimestamp,
        ).not.toHaveBeenCalled();
      });

      it('should delete old db if version is deprecated', async () => {
        DaoGlobalConfig.getDBSchemaVersion = jest.fn().mockReturnValueOnce(0);
        AccountGlobalConfig.getUserDictionary.mockReturnValue('123');
        await daoManager.initDatabase();
        expect(DBManager.mock.instances[0].deleteDatabase).toHaveBeenCalled();
        expect(
          SyncUserConfig.prototype.removeLastIndexTimestamp,
        ).toHaveBeenCalled();
      });

      it('should delete old db if local version is not found', async () => {
        DaoGlobalConfig.getDBSchemaVersion = jest
          .fn()
          .mockReturnValueOnce(null);
        await daoManager.initDatabase();
        expect(DBManager.mock.instances[0].deleteDatabase).toHaveBeenCalled();
        expect(
          SyncUserConfig.prototype.removeLastIndexTimestamp,
        ).toHaveBeenCalled();
      });

      it('should set callback for when db is open', async () => {
        const db = new DexieDB({
          name: 'db',
          version: 1,
          schema: {},
        });
        db.db = new Dexie('');
        jest.spyOn(db.db, 'on');
        DBManager.mock.instances[0].getDatabase.mockReturnValue(db);
        await daoManager.initDatabase();
        expect(db.db.on).toHaveBeenCalled();
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
