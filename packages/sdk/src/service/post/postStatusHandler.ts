// import { SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER } from 'constants';

/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-05-23 15:03:23
 */

import { POST_STATUS } from '../constants';
import { daoManager, ConfigDao, PRE_INSERT_IDS } from '../../dao';

class PostStatusHandler {
  private _preInsertIds: { [id: number]: POST_STATUS } = {};

  constructor() {
    this._init();
  }

  private _init() {
    const configDao = daoManager.getKVDao(ConfigDao);
    const preinsertIds = configDao.get(PRE_INSERT_IDS);
    this._preInsertIds = preinsertIds || {};
  }

  clear(): void {
    this._preInsertIds = {};
    this._syncDao();
  }

  setPreInsertId(
    id: number,
    status: POST_STATUS = POST_STATUS.INPROGRESS,
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

  private _syncDao() {
    const configDao = daoManager.getKVDao(ConfigDao);
    configDao.put(PRE_INSERT_IDS, this._preInsertIds);
  }
}

export { PostStatusHandler };
