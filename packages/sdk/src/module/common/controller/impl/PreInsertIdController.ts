/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-07 10:23:23
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager, ConfigDao } from '../../../../dao';
import { JSdkError } from '../../../../error';
import { IPreInsertIdController } from '../interface/IPreInsertIdController';

const PREINSERT_KEY_ID = 'PREINSERT_KEY_ID';

class PreInsertIdController implements IPreInsertIdController {
  private _versions: number[] = [];
  private _modelName: string;
  constructor(modelName: string) {
    this._modelName = `${modelName}_${PREINSERT_KEY_ID}`;
    this._initVersions();
  }

  private _initVersions() {
    const dao: ConfigDao = daoManager.getKVDao(ConfigDao);
    this._versions = dao.get(this._modelName) || {};
  }

  private _syncDataDB() {
    const dao: ConfigDao = daoManager.getKVDao(ConfigDao);
    dao.put(this._modelName, this._versions);
  }

  isInPreInsert(version: number): boolean {
    return this._versions.includes(version);
  }

  async insertId(version: number): Promise<void> {
    if (this.isInPreInsert(version)) {
      throw new JSdkError(
        'PreInsertIdController',
        `Already has the version ${version}`,
      );
    }
    this._versions.push(version);
    this._syncDataDB();
  }

  async deleteId(version: number): Promise<void> {
    const index = this._versions.indexOf(version);
    if (index !== -1) {
      this._versions.splice(index, 1);
      this._syncDataDB();
    }
  }

  getAll() {
    return this._versions;
  }
}

export default PreInsertIdController;
