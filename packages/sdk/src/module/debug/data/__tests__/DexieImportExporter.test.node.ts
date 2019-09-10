/*
 * @Author: Paynter Chen
 * @Date: 2019-08-28 13:20:07
 * Copyright © RingCentral. All rights reserved.
 */

import { importDB, exportDB } from 'dexie-export-import';
import { daoManager } from 'sdk/dao';
import { DatabaseType } from 'foundation/db';
import { DexieImportExporter } from '../DexieImportExporter';

jest.mock('sdk/dao/DaoManager', () => {
  const db = {
    ensureDBOpened: jest.fn(),
  };
  const mockDaoManager = {
    initDatabase: jest.fn(),
    getDatabaseType: jest.fn(),
    isDatabaseOpen: jest.fn(),
    getDataBase: jest.fn(() => db),
  };
  return () => mockDaoManager;
});
jest.mock('dexie-export-import', () => {
  return {
    importDB: jest.fn(),
    exportDB: jest.fn(),
  };
});

describe('DexieImportExporter', () => {
  const prepare = () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  };
  describe('export()', () => {
    beforeEach(prepare);
    it('should support export dexie', async () => {
      daoManager.getDatabaseType.mockReturnValue(DatabaseType.DexieDB);
      daoManager.isDatabaseOpen.mockReturnValue(true);
      const target = new DexieImportExporter();
      await target.export();
      expect(daoManager.getDatabaseType).toHaveBeenCalled();
      expect(daoManager.isDatabaseOpen).toHaveBeenCalled();
      expect(daoManager.initDatabase).not.toHaveBeenCalled();
      expect(daoManager.getDataBase).toHaveBeenCalled();
      expect(exportDB).toHaveBeenCalled();
    });
    it('should init dataBase when db is not open', async () => {
      daoManager.getDatabaseType.mockReturnValue(DatabaseType.DexieDB);
      daoManager.isDatabaseOpen.mockReturnValue(false);
      const target = new DexieImportExporter();
      await target.export();
      expect(daoManager.getDatabaseType).toHaveBeenCalled();
      expect(daoManager.isDatabaseOpen).toHaveBeenCalled();
      expect(daoManager.initDatabase).toHaveBeenCalled();
      expect(daoManager.getDataBase).toHaveBeenCalled();
      expect(exportDB).toHaveBeenCalled();
    });
    it('should abort when dataBaseType is not dexie', async () => {
      daoManager.getDatabaseType.mockReturnValue(DatabaseType.LokiDB);
      daoManager.isDatabaseOpen.mockReturnValue(true);
      const target = new DexieImportExporter();
      await expect(target.export()).rejects.not.toBeUndefined();
      expect(daoManager.getDatabaseType).toHaveBeenCalled();
      expect(daoManager.isDatabaseOpen).not.toHaveBeenCalled();
      expect(daoManager.initDatabase).not.toHaveBeenCalled();
      expect(daoManager.getDataBase).not.toHaveBeenCalled();
      expect(exportDB).not.toHaveBeenCalled();
    });
  });
  describe('validate()', () => {
    beforeEach(prepare);
    it('should return true', async () => {
      const target = new DexieImportExporter();
      const result = await target.validate({} as any);
      expect(result).toBeTruthy();
    });
    it('should return false', async () => {
      const target = new DexieImportExporter();
      const result = await target.validate(null as any);
      expect(result).toBeFalsy();
    });
  });
  describe('import()', () => {
    beforeEach(prepare);
    it('should call importDB', async () => {
      const target = new DexieImportExporter();
      await target.import({} as any);
      expect(importDB).toHaveBeenCalled();
    });
  });
});
