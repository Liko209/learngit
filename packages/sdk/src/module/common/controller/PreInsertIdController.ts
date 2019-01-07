/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-07 10:23:23
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager, ConfigDao } from '../../../dao';
import { Throw } from '../../../utils';

type PreInsertIdType = {
  id: number;
  version: number;
};

const PREINSERT_KEY_ID = 'PREINSERT_KEY_ID';

class PreInsertIdController<BaseDao> {
  private _versionIdMap: { [version: number]: number };
  private _modelName: string;
  constructor(public DaoClass: any) {
    this._modelName = daoManager.getDao(this.DaoClass).modelName;
    this._modelName = `${this._modelName}_${PREINSERT_KEY_ID}`;
    this._initVersionIdMap();
  }

  private _initVersionIdMap<T>() {
    const dao: ConfigDao = daoManager.getKVDao(ConfigDao);
    this._versionIdMap = dao.get(this._modelName) || {};
  }

  private _syncDataDB() {
    const dao: ConfigDao = daoManager.getKVDao(ConfigDao);
    dao.put(this._modelName, this._versionIdMap);
  }

  async insertId({ id, version }: PreInsertIdType): Promise<void> {
    if (this._versionIdMap[version]) {
      throw new Error(`Already has the version ${version}`);
    }
    this._versionIdMap[version] = id;
  }

  async removeIdByVersion(version: number): Promise<void> {
    const dao = daoManager.getDao(this.DaoClass);
    const id = this._versionIdMap[version];
    id && (await dao.delete(id));
    delete this._versionIdMap[version];
  }
}

export default PreInsertIdController;
