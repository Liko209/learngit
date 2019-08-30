/*
 * @Author: Paynter Chen
 * @Date: 2019-08-28 15:44:20
 * Copyright © RingCentral. All rights reserved.
 */
import { IDataImporter, IDataExporter } from './types';

import { importDB, exportDB } from 'dexie-export-import';
import { daoManager } from 'sdk/dao';
import { DatabaseType } from 'foundation/db';
import { JSdkError, ERROR_CODES_DB } from 'sdk/error';

export class DexieImportExporter
  implements IDataImporter<Blob>, IDataExporter<Blob> {
  async import(data: Blob): Promise<void> {
    await importDB(data);
  }

  async validate(data: Blob): Promise<boolean> {
    return !!data;
  }

  async export(): Promise<Blob> {
    if (daoManager.getDatabaseType() !== DatabaseType.DexieDB) {
      throw new JSdkError(
        ERROR_CODES_DB.GENERAL,
        `Export db type: ${daoManager.getDatabaseType()} is Not support.`,
      );
    }
    if (!daoManager.isDatabaseOpen()) {
      await daoManager.initDatabase(async () => {});
    }
    const db = daoManager.getDataBase();
    await db.ensureDBOpened();
    return exportDB((db as any).db);
  }
}
