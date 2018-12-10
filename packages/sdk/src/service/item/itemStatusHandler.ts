/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-12-07 13:53:31
 * Copyright © RingCentral. All rights reserved.
 */

import { SENDING_STATUS } from '../constants';
import { daoManager, ConfigDao } from '../../dao';

class ItemStatusHandler {
  private _configDaoKey: string;
  private _preInsertIds: { [id: number]: SENDING_STATUS } = {};

  constructor(daoKey: string) {
    this._init();
    this._configDaoKey = daoKey;
  }

  private _init() {
    const configDao = daoManager.getKVDao(ConfigDao);
    this._preInsertIds = configDao.get(this._configDaoKey) || {};
  }

  clear(): void {
    this._preInsertIds = {};
    this._syncDao();
  }

  setPreInsertId(
    id: number,
    status: SENDING_STATUS = SENDING_STATUS.INPROGRESS,
  ): void {
    this._preInsertIds[id] = status;
    this._syncDao();
  }

  removePreInsertId(id: number): void {
    delete this._preInsertIds[id];
    this._syncDao();
  }

  isInPreInsert(id: number) {
    const status = this._preInsertIds[id];
    return !!status;
  }

  getPreInsertIds() {
    return this._preInsertIds;
  }

  getSendingStatus(id: number) {
    return this._preInsertIds[id];
  }

  private _syncDao() {
    const configDao = daoManager.getKVDao(ConfigDao);
    configDao.put(this._configDaoKey, this._preInsertIds);
  }
}

export { ItemStatusHandler };
