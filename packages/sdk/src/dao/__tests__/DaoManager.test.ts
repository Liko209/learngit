/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-28 00:26:24
 */
/// <reference path="../../__tests__/types.d.ts" />
import {
  KVStorage,
  DBManager,
  KVStorageManager,
  DexieDB,
  IDatabase,
} from 'foundation';
import DaoManager from '../DaoManager';
import { BaseDao, BaseKVDao } from '../../framework/dao';
import Dexie from 'dexie';
import { IdModel } from '../../framework/model';
import { GlobalConfigService, UserConfigService } from '../../module/config';
import { NewGlobalConfig } from '../../service/config/NewGlobalConfig1';
import { AuthGlobalConfig } from '../../service/auth/config';

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
jest.mock('../../service/config/NewGlobalConfig1');
jest.mock('../../service/auth/config');
GlobalConfigService.getInstance = jest.fn();
UserConfigService.getInstance = jest.fn();

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
    daoManager = new DaoManager();
  });

  describe('initDataBase()', () => {
    it('should init database', async () => {
      NewGlobalConfig.getDBSchemaVersion = jest.fn().mockReturnValue(1);
      await daoManager.initDatabase();
      expect(DBManager.mock.instances[0].initDatabase).toHaveBeenCalled();
    });

    describe('db upgrade', () => {
      it('should not delete old db if version is same', async () => {
        NewGlobalConfig.getDBSchemaVersion = jest.fn().mockReturnValue(1);
        await daoManager.initDatabase();
        expect(
          DBManager.mock.instances[0].deleteDatabase,
        ).not.toHaveBeenCalled();
        expect(NewGlobalConfig.removeLastIndexTimestamp).not.toHaveBeenCalled();
      });

      it('should delete old db if version is deprecated', async () => {
        NewGlobalConfig.getDBSchemaVersion = jest.fn().mockReturnValue(0);
        await daoManager.initDatabase();
        expect(DBManager.mock.instances[0].deleteDatabase).toHaveBeenCalled();
        expect(NewGlobalConfig.removeLastIndexTimestamp).toHaveBeenCalled();
      });

      it('should delete old db if local version is not found', async () => {
        NewGlobalConfig.getDBSchemaVersion = jest.fn().mockReturnValue(null);
        await daoManager.initDatabase();
        expect(DBManager.mock.instances[0].deleteDatabase).toHaveBeenCalled();
        expect(NewGlobalConfig.removeLastIndexTimestamp).toHaveBeenCalled();
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
      expect(AuthGlobalConfig.removeGlipToken).toHaveBeenCalled();
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
