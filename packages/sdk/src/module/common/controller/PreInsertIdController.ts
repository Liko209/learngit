/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-07 10:23:23
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager, ConfigDao, BaseDao } from '../../../dao';
import { JSdkError } from '../../../error';

type PreInsertIdType = {
  id: number;
  version: number;
};

const PREINSERT_KEY_ID = 'PREINSERT_KEY_ID';

class PreInsertIdController<T> {
  private _versionIdMap: { [version: number]: number };
  private _modelName: string;
  private _dao: BaseDao<T>;
  constructor(dao: BaseDao<T>) {
    this._modelName = `${dao.modelName}_${PREINSERT_KEY_ID}`;
    this._dao = dao;
    this._initVersionIdMap();
  }

  private _initVersionIdMap() {
    const dao: ConfigDao = daoManager.getKVDao(ConfigDao);
    this._versionIdMap = dao.get(this._modelName) || {};
  }

  private _syncDataDB() {
    const dao: ConfigDao = daoManager.getKVDao(ConfigDao);
    dao.put(this._modelName, this._versionIdMap);
  }

  async insertId({ id, version }: PreInsertIdType): Promise<void> {
    if (this._versionIdMap[version]) {
      throw new JSdkError(
        'PreInsertIdController',
        `Already has the version ${version}`,
      );
    }
    this._versionIdMap[version] = id;
    this._syncDataDB();
  }

  async removeIdByVersion(version: number): Promise<void> {
    const id = this._versionIdMap[version];
    id && (await this._dao.delete(id));
    delete this._versionIdMap[version];
    this._syncDataDB();
  }

  getAll() {
    return this._versionIdMap;
  }
}

export default PreInsertIdController;
