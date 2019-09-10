/*
 * @Author: Paynter Chen
 * @Date: 2019-08-28 13:20:07
 * Copyright © RingCentral. All rights reserved.
 */
import JSZip from 'jszip';
import { AccountService } from 'sdk/module/account';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { saveBlob, loadFile } from 'sdk/utils/fileUtils';
import { DexieImportExporter } from '../DexieImportExporter';
import { LocalStorageImportExporter } from '../LocalStorageImportExporter';
import { DataModule } from '../DataModule';

jest.mock('../DexieImportExporter', () => {
  const mock = {
    import: jest.fn(),
    validate: jest.fn().mockResolvedValue(true),
    export: jest.fn().mockResolvedValue({}),
  };
  return {
    DexieImportExporter: () => mock,
  };
});
jest.mock('../LocalStorageImportExporter', () => {
  const mock = {
    import: jest.fn(),
    validate: jest.fn().mockResolvedValue(true),
    export: jest.fn().mockResolvedValue({}),
  };
  return {
    LocalStorageImportExporter: () => mock,
  };
});
jest.mock('sdk/utils/fileUtils');
jest.mock('dexie-export-import', () => {
  return {
    importDB: jest.fn(),
    exportDB: jest.fn(),
  };
});

jest.mock('jszip', () => {
  const mock = {
    file: jest.fn(),
    // loadAsync: jest.fn(),
    generateAsync: jest.fn().mockImplementation(() => {}),
  };
  const mockModule = () => mock;
  mockModule.loadAsync = jest.fn();
  return mockModule;
});

describe('DataModule', () => {
  let mockAccountService: AccountService;
  let mockLocalStorageImporterExporter: LocalStorageImportExporter;
  let mockDexieImporterExporter: DexieImportExporter;
  const prepare = () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    window.location = {
      reload: jest.fn(),
    };
    mockAccountService = {
      logout: jest.fn(),
    } as any;
    ServiceLoader.getInstance = () => {
      return mockAccountService;
    };
    mockLocalStorageImporterExporter = new LocalStorageImportExporter();
    mockDexieImporterExporter = new DexieImportExporter();
  };
  describe('importData()', () => {
    beforeEach(prepare);
    it('should importData work when validate', async () => {
      loadFile.mockResolvedValue({});
      JSZip.loadAsync.mockResolvedValue({
        file: () => ({
          async: (type: string) => ({
            type,
          }),
        }),
      });
      const dataModule = new DataModule();
      await dataModule.importData();
      expect(loadFile).toHaveBeenCalled();
      expect(mockLocalStorageImporterExporter.validate).toHaveBeenCalled();
      expect(mockLocalStorageImporterExporter.import).toHaveBeenCalled();
      expect(mockDexieImporterExporter.validate).toHaveBeenCalled();
      expect(mockDexieImporterExporter.import).toHaveBeenCalled();
      expect(window.location.reload).toHaveBeenCalled();
    });
    it('should stop importData work when not validate', async () => {
      loadFile.mockResolvedValue({});
      JSZip.loadAsync.mockResolvedValue({
        file: () => ({
          async: (type: string) => ({
            type,
          }),
        }),
      });
      mockLocalStorageImporterExporter.validate.mockReturnValue(false);
      const dataModule = new DataModule();
      await dataModule.importData();
      expect(loadFile).toHaveBeenCalled();
      expect(mockLocalStorageImporterExporter.validate).toHaveBeenCalled();
      expect(mockLocalStorageImporterExporter.import).not.toHaveBeenCalled();
      expect(mockDexieImporterExporter.import).not.toHaveBeenCalled();
      expect(window.location.reload).not.toHaveBeenCalled();
    });
  });
  describe('getExportZipData()', () => {
    beforeEach(prepare);
    it('should bundle dexie and localStorage', async () => {
      const dataModule = new DataModule();
      const jsZip = new JSZip();
      const result = await dataModule.getExportZipData();
      expect(jsZip.file).toHaveBeenCalledWith(
        'db.json',
        expect.objectContaining({}),
      );
      expect(jsZip.file).toHaveBeenCalledWith(
        'localStorage.json',
        expect.objectContaining({}),
      );
    });
  });
  describe('exportData()', () => {
    beforeEach(prepare);
    it('should ', async () => {
      const dataModule = new DataModule();
      jest.spyOn(dataModule, 'getExportZipData').mockResolvedValue('test');
      await dataModule.exportData();
      expect(saveBlob).toHaveBeenCalledWith('data.zip', 'test');
    });
  });
});
