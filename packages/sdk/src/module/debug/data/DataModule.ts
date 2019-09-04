/*
 * @Author: Paynter Chen
 * @Date: 2019-07-08 10:42:54
 * Copyright © RingCentral. All rights reserved.
 */

import JSZip from 'jszip';
import { AccountService } from 'sdk/module/account';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { BaseDebugModule } from '../BaseDebugModule';
import { saveBlob, loadFile } from 'sdk/utils/fileUtils';
import { DexieImportExporter } from './DexieImportExporter';
import { LocalStorageImportExporter } from './LocalStorageImportExporter';
import { mainLogger } from 'foundation/src/log';
import { AppDataItemProvider } from './AppDataItemProvider';
import { LogControlManager } from 'sdk/module/log';

const ZIP_COMPRESS_LEVEL = 9;

const FILE_NAME_MAP = {
  DB: 'db.json',
  LOCAL_STORAGE: 'localStorage.json',
};

export class DataModule extends BaseDebugModule {
  dexie: DexieImportExporter;
  localStorage: LocalStorageImportExporter;
  constructor() {
    super();
    this.dexie = new DexieImportExporter();
    this.localStorage = new LocalStorageImportExporter();
    this.inject('import', this.importData);
    this.inject('export', this.exportData);
    LogControlManager.instance().registerZipProvider(
      new AppDataItemProvider({
        getAppData: () => this.getExportZipData(),
      }),
    );
  }

  importData = async () => {
    const file = await loadFile();
    const zip = await JSZip.loadAsync(file);
    const dbBlob = await zip.file(FILE_NAME_MAP.DB).async('blob');
    const localStorageJson = await zip
      .file(FILE_NAME_MAP.LOCAL_STORAGE)
      .async('text');
    if (
      !(await this.localStorage.validate(localStorageJson)) ||
      !(await this.dexie.validate(dbBlob))
    ) {
      mainLogger.debug('import data fail. Please check the data.');
      return;
    }
    await ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).logout();
    await this.localStorage.import(localStorageJson);
    await this.dexie.import(dbBlob);
    window.location.reload();
  };

  getExportZipData = async (): Promise<Blob> => {
    const dbBlob = await this.dexie.export();
    const localStorageJson = await this.localStorage.export();
    const zip = new JSZip();
    zip.file(FILE_NAME_MAP.DB, dbBlob);
    zip.file(FILE_NAME_MAP.LOCAL_STORAGE, localStorageJson);
    return zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: ZIP_COMPRESS_LEVEL,
      },
    });
  };

  exportData = async (name: string = 'data') => {
    const exportZip = await this.getExportZipData();
    saveBlob(`${name}.zip`, exportZip);
  };
}

const data = new DataModule();
export { data };
